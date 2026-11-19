import test from 'node:test';
import assert from 'node:assert/strict';
import { ClientCacheManager, CACHE_KEYS, CACHE_ENTRY_VERSION } from './cacheService';
import { resolveRevalidationState, shouldBackgroundRevalidate } from '../hooks/useCachedResource';

test('ClientCacheManager stores entries and computes freshness against TTL', () => {
  const cache = new ClientCacheManager();
  cache.set(CACHE_KEYS.projectsList, [{ id: 'cpp' }], 5000, 1000);

  const freshHit = cache.get<{ id: string }[]>(CACHE_KEYS.projectsList, 4000);
  assert.ok(freshHit);
  assert.equal(freshHit.isFresh, true);
  assert.equal(freshHit.data[0].id, 'cpp');

  const staleHit = cache.get<{ id: string }[]>(CACHE_KEYS.projectsList, 7000);
  assert.ok(staleHit);
  assert.equal(staleHit.isFresh, false);
  assert.equal(staleHit.data[0].id, 'cpp');
});

test('ClientCacheManager invalidates by prefix and notifies subscribers', () => {
  const cache = new ClientCacheManager();
  cache.set(CACHE_KEYS.projectsList, ['list'], 60000, 1000);
  cache.set(CACHE_KEYS.projectBySlug('cpp'), { id: 'cpp' }, 60000, 1000);
  cache.set(CACHE_KEYS.coursesList, ['course-1'], 60000, 1000);

  const events: string[] = [];
  const unsubscribe = cache.subscribe((pattern) => events.push(pattern));

  cache.invalidate('public:projects:');
  assert.equal(cache.get(CACHE_KEYS.projectsList, 2000), null);
  assert.equal(cache.get(CACHE_KEYS.projectBySlug('cpp'), 2000), null);
  assert.ok(cache.get(CACHE_KEYS.coursesList, 2000));
  assert.deepEqual(events, ['public:projects:']);

  unsubscribe();
  cache.clear();
  assert.equal(cache.get(CACHE_KEYS.coursesList, 2000), null);
  assert.deepEqual(events, ['public:projects:']);
});

test('ClientCacheManager evicts entries failing version, key, or shape validators', () => {
  const cache = new ClientCacheManager();
  cache.set(CACHE_KEYS.projectsList, [{ id: 'cpp' }], 5000, 1000);

  // Valid shape passes
  const validHit = cache.get<{ id: string }[]>(
    CACHE_KEYS.projectsList,
    2000,
    (data): data is { id: string }[] => Array.isArray(data)
  );
  assert.ok(validHit);
  assert.equal(CACHE_ENTRY_VERSION, 1);

  // Failing shape validator evicts entry
  const rejectedHit = cache.get<string>(
    CACHE_KEYS.projectsList,
    2000,
    (data): data is string => typeof data === 'string'
  );
  assert.equal(rejectedHit, null);
  assert.equal(cache.get(CACHE_KEYS.projectsList, 2000), null);
});

test('resolveRevalidationState preserves stale cached data and skips persistence when background fetch returns error', () => {
  const prev = { status: 'success', items: ['cpp'] };
  const nextErr = { status: 'error', items: [] as string[] };

  const bgOutcome = resolveRevalidationState({
    previousData: prev,
    nextResult: nextErr,
    background: true,
    isErrorResult: (r) => r.status === 'error',
  });
  assert.deepEqual(bgOutcome.data, prev);
  assert.equal(bgOutcome.isStale, true);
  assert.equal(bgOutcome.shouldCache, false);

  const fgOutcome = resolveRevalidationState({
    previousData: null,
    nextResult: nextErr,
    background: false,
    isErrorResult: (r) => r.status === 'error',
  });
  assert.deepEqual(fgOutcome.data, nextErr);
  assert.equal(fgOutcome.isStale, false);
  assert.equal(fgOutcome.shouldCache, false);
});

test('ClientCacheManager.dedupe shares concurrent fetches, clears on settle/error, and evicts on invalidate', async () => {
  const cache = new ClientCacheManager();
  let calls = 0;
  let resolveFirst!: (val: string) => void;

  const p1 = cache.dedupe('key:a', () => {
    calls += 1;
    return new Promise<string>((resolve) => {
      resolveFirst = resolve;
    });
  });
  const p2 = cache.dedupe('key:a', () => {
    calls += 1;
    return Promise.resolve('should-not-run');
  });

  assert.equal(calls, 1);
  assert.strictEqual(p1, p2);
  resolveFirst('ok');
  const [r1, r2] = await Promise.all([p1, p2]);
  assert.equal(r1, 'ok');
  assert.equal(r2, 'ok');

  // After settling, a subsequent dedupe starts a new fetch
  const r3 = await cache.dedupe('key:a', () => {
    calls += 1;
    return Promise.resolve('second');
  });
  assert.equal(calls, 2);
  assert.equal(r3, 'second');

  // Failed fetch also cleans up inFlight
  await assert.rejects(
    cache.dedupe('key:err', () => {
      calls += 1;
      return Promise.reject(new Error('boom'));
    }),
    /boom/
  );
  const recovered = await cache.dedupe('key:err', () => {
    calls += 1;
    return Promise.resolve('recovered');
  });
  assert.equal(recovered, 'recovered');
  assert.equal(calls, 4);

  // invalidate clears matching in-flight promise immediately
  let resolveStale!: (val: string) => void;
  const inflightBeforeInvalidate = cache.dedupe('public:projects:list', () => {
    calls += 1;
    return new Promise<string>((resolve) => {
      resolveStale = resolve;
    });
  });
  cache.invalidate('public:projects:');
  const freshAfterInvalidate = await cache.dedupe('public:projects:list', () => {
    calls += 1;
    return Promise.resolve('fresh-after-invalidate');
  });
  assert.equal(freshAfterInvalidate, 'fresh-after-invalidate');
  assert.equal(calls, 6);
  resolveStale('stale');
  assert.equal(await inflightBeforeInvalidate, 'stale');
});

test('shouldBackgroundRevalidate skips background fetches for fresh entries unless forced', () => {
  assert.equal(shouldBackgroundRevalidate({ isFresh: true }), false);
  assert.equal(shouldBackgroundRevalidate({ isFresh: true, forceRevalidate: false }), false);
  assert.equal(shouldBackgroundRevalidate({ isFresh: true, forceRevalidate: true }), true);
  assert.equal(shouldBackgroundRevalidate({ isFresh: false }), true);
});

