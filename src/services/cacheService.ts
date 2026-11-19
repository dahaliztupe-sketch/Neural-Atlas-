export const CACHE_ENTRY_VERSION = 1;

export interface CacheEntry<T> {
  version: number;
  key: string;
  data: T;
  storedAt: number;
  ttlMs: number;
}

export type CacheListener = (invalidatedKeyOrPrefix: string) => void;

const STORAGE_PREFIX = 'na_cache_v1:';
const BROADCAST_CHANNEL_NAME = 'na_cache_sync_v1';
export const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

export class ClientCacheManager {
  private memory = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, Promise<unknown>>();
  private listeners = new Set<CacheListener>();
  private channel: BroadcastChannel | null = null;
  private channelInitialized = false;

  private ensureChannel(): BroadcastChannel | null {
    if (this.channelInitialized) return this.channel;
    this.channelInitialized = true;
    try {
      if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        ch.onmessage = (event: MessageEvent<{ type?: string; keyOrPrefix?: string }>) => {
          if (event?.data?.type === 'invalidate' && typeof event.data.keyOrPrefix === 'string') {
            this.invalidateInternal(event.data.keyOrPrefix, false);
          } else if (event?.data?.type === 'clear') {
            this.clearInternal(false);
          }
        };
        this.channel = ch;
      }
    } catch {
      this.channel = null;
    }
    return this.channel;
  }

  private getStorage(): Storage | null {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage;
      }
    } catch {
      // Ignore storage security errors in restricted sandboxes
    }
    return null;
  }

  get<T>(
    key: string,
    now = Date.now(),
    validator?: (data: unknown) => data is T
  ): { data: T; isFresh: boolean } | null {
    this.ensureChannel();
    const memEntry = this.memory.get(key) as CacheEntry<T> | undefined;
    if (memEntry) {
      if (
        memEntry.version !== CACHE_ENTRY_VERSION ||
        memEntry.key !== key ||
        (validator && !validator(memEntry.data))
      ) {
        this.memory.delete(key);
        return null;
      }
      return {
        data: memEntry.data,
        isFresh: now - memEntry.storedAt < memEntry.ttlMs,
      };
    }

    const storage = this.getStorage();
    if (!storage) return null;

    try {
      const raw = storage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CacheEntry<T>;
      if (
        !parsed ||
        parsed.version !== CACHE_ENTRY_VERSION ||
        parsed.key !== key ||
        typeof parsed.storedAt !== 'number' ||
        typeof parsed.ttlMs !== 'number' ||
        !('data' in parsed) ||
        (validator && !validator(parsed.data))
      ) {
        storage.removeItem(`${STORAGE_PREFIX}${key}`);
        return null;
      }
      this.memory.set(key, parsed);
      return {
        data: parsed.data,
        isFresh: now - parsed.storedAt < parsed.ttlMs,
      };
    } catch {
      return null;
    }
  }

  set<T>(key: string, data: T, ttlMs = DEFAULT_CACHE_TTL_MS, now = Date.now()): void {
    this.ensureChannel();
    const safeTtl = Math.max(1000, ttlMs);
    const entry: CacheEntry<T> = {
      version: CACHE_ENTRY_VERSION,
      key,
      data,
      storedAt: now,
      ttlMs: safeTtl,
    };
    this.memory.set(key, entry);

    const storage = this.getStorage();
    if (storage) {
      try {
        storage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
      } catch {
        // Ignore quota exceeded errors; memory cache remains authoritative
      }
    }
  }

  dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key) as Promise<T> | undefined;
    if (existing) {
      return existing;
    }
    let promise: Promise<T>;
    try {
      promise = Promise.resolve(fetcher());
    } catch (err) {
      promise = Promise.reject(err);
    }
    const wrapped = promise.finally(() => {
      if (this.inFlight.get(key) === wrapped) {
        this.inFlight.delete(key);
      }
    });
    this.inFlight.set(key, wrapped);
    return wrapped;
  }

  invalidate(keyOrPrefix: string): void {
    this.invalidateInternal(keyOrPrefix, true);
  }

  private invalidateInternal(keyOrPrefix: string, broadcast: boolean): void {
    if (!keyOrPrefix) return;

    for (const key of Array.from(this.inFlight.keys())) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.inFlight.delete(key);
      }
    }

    for (const key of Array.from(this.memory.keys())) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.memory.delete(key);
      }
    }

    const storage = this.getStorage();
    if (storage) {
      try {
        const storageTargetPrefix = `${STORAGE_PREFIX}${keyOrPrefix}`;
        const toRemove: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const storageKey = storage.key(i);
          if (storageKey && storageKey.startsWith(storageTargetPrefix)) {
            toRemove.push(storageKey);
          }
        }
        for (const key of toRemove) {
          storage.removeItem(key);
        }
      } catch {
        // Ignore storage access errors
      }
    }

    if (broadcast) {
      try {
        this.ensureChannel()?.postMessage({ type: 'invalidate', keyOrPrefix });
      } catch {
        // Ignore closed channel
      }
    }

    for (const listener of this.listeners) {
      try {
        listener(keyOrPrefix);
      } catch {
        // Isolate subscriber callback failures
      }
    }
  }

  clear(): void {
    this.clearInternal(true);
  }

  private clearInternal(broadcast: boolean): void {
    this.inFlight.clear();
    this.memory.clear();
    const storage = this.getStorage();
    if (storage) {
      try {
        const toRemove: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const storageKey = storage.key(i);
          if (storageKey && storageKey.startsWith(STORAGE_PREFIX)) {
            toRemove.push(storageKey);
          }
        }
        for (const key of toRemove) {
          storage.removeItem(key);
        }
      } catch {
        // Ignore storage errors
      }
    }

    if (broadcast) {
      try {
        this.ensureChannel()?.postMessage({ type: 'clear' });
      } catch {
        // Ignore closed channel
      }
    }

    for (const listener of this.listeners) {
      try {
        listener('*');
      } catch {
        // Ignore listener errors
      }
    }
  }

  subscribe(listener: CacheListener): () => void {
    this.ensureChannel();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const clientCache = new ClientCacheManager();

export const CACHE_KEYS = {
  projectsList: 'public:projects:list',
  projectSlugPrefix: 'public:projects:slug:',
  projectBySlug: (slug: string) => `public:projects:slug:${slug}`,
  coursesList: 'public:courses:list',
  notesList: 'public:notes:list',
  noteSlugPrefix: 'public:notes:slug:',
  noteBySlug: (slug: string) => `public:notes:slug:${slug}`,
  milestonesList: 'public:milestones:list',
  profile: 'public:profile',
} as const;
