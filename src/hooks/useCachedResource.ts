import { useCallback, useEffect, useRef, useState } from 'react';
import { clientCache, DEFAULT_CACHE_TTL_MS } from '../services/cacheService';

export interface UseCachedResourceOptions<T> {
  enabled?: boolean;
  bypassCache?: boolean;
  ttlMs?: number;
  shouldPersist?: (result: T) => boolean;
  isErrorResult?: (result: T) => boolean;
}

export interface UseCachedResourceState<T> {
  data: T | null;
  loading: boolean;
  isRevalidating: boolean;
  isStale: boolean;
  error: unknown;
  refresh: () => Promise<void>;
}

/**
 * Pure SWR transition helper (decoupled so unit tests can assert exact stale preservation).
 */
export function resolveRevalidationState<T>(params: {
  previousData: T | null;
  nextResult: T;
  background: boolean;
  isErrorResult?: (result: T) => boolean;
}): { data: T; isStale: boolean; shouldCache: boolean } {
  const isErr = params.isErrorResult ? params.isErrorResult(params.nextResult) : false;
  if (params.background && isErr && params.previousData !== null) {
    return {
      data: params.previousData,
      isStale: true,
      shouldCache: false,
    };
  }
  return {
    data: params.nextResult,
    isStale: isErr && params.previousData !== null,
    shouldCache: !isErr,
  };
}

export function shouldBackgroundRevalidate(params: {
  isFresh: boolean;
  forceRevalidate?: boolean;
}): boolean {
  return !params.isFresh || Boolean(params.forceRevalidate);
}

export function useCachedResource<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: UseCachedResourceOptions<T> = {}
): UseCachedResourceState<T> {
  const {
    enabled = true,
    bypassCache = false,
    ttlMs = DEFAULT_CACHE_TTL_MS,
    shouldPersist,
    isErrorResult,
  } = options;

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const shouldPersistRef = useRef(shouldPersist);
  shouldPersistRef.current = shouldPersist;

  const isErrorResultRef = useRef(isErrorResult);
  isErrorResultRef.current = isErrorResult;

  const [data, setData] = useState<T | null>(() => {
    if (!enabled || bypassCache) return null;
    return clientCache.get<T>(cacheKey)?.data ?? null;
  });
  const dataRef = useRef<T | null>(data);
  dataRef.current = data;

  const [loading, setLoading] = useState<boolean>(() => {
    if (!enabled) return false;
    if (bypassCache) return true;
    return clientCache.get<T>(cacheKey) === null;
  });
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const executeFetch = useCallback(
    async (background: boolean) => {
      if (!enabled) return;
      if (background) {
        setIsRevalidating(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = bypassCache
          ? await fetcherRef.current()
          : await clientCache.dedupe(cacheKey, () => fetcherRef.current());
        if (!mountedRef.current) return;

        const outcome = resolveRevalidationState({
          previousData: dataRef.current,
          nextResult: result,
          background,
          isErrorResult: isErrorResultRef.current,
        });

        const allowPersist =
          !bypassCache &&
          outcome.shouldCache &&
          (shouldPersistRef.current ? shouldPersistRef.current(result) : true);

        if (allowPersist) {
          clientCache.set(cacheKey, result, ttlMs);
        }

        setData(outcome.data);
        setIsStale(outcome.isStale);
        setLoading(false);
        setIsRevalidating(false);
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err);
        if (background && dataRef.current !== null) {
          setIsStale(true);
        }
        setLoading(false);
        setIsRevalidating(false);
      }
    },
    [bypassCache, cacheKey, enabled, ttlMs]
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setIsRevalidating(false);
      setIsStale(false);
      return;
    }

    const cached = bypassCache ? null : clientCache.get<T>(cacheKey);
    if (cached) {
      setData(cached.data);
      setIsStale(!cached.isFresh);
      setLoading(false);
      if (shouldBackgroundRevalidate({ isFresh: cached.isFresh })) {
        void executeFetch(true);
      }
    } else {
      setData(null);
      setIsStale(false);
      void executeFetch(false);
    }
  }, [bypassCache, cacheKey, enabled, executeFetch]);

  useEffect(() => {
    if (!enabled || bypassCache) return;
    return clientCache.subscribe((pattern) => {
      if (pattern === '*' || cacheKey === pattern || cacheKey.startsWith(pattern)) {
        const currentCached = clientCache.get<T>(cacheKey);
        void executeFetch(Boolean(currentCached));
      }
    });
  }, [bypassCache, cacheKey, enabled, executeFetch]);

  const refresh = useCallback(async () => {
    await executeFetch(false);
  }, [executeFetch]);

  return { data, loading, isRevalidating, isStale, error, refresh };
}
