import { QueryCache } from 'react-query';
import { markCorrectionQueriesStale } from '../../../../src/frontend/site/pages/tasks/review-listing/correction-cache';

// SSR hydration supplies data without a loader. useData(..., refetchOnMount:false) can leave
// the cache-level placeholder intact, even though the mounted observer has the real loader.
test('correction refresh preserves hydrated queries until their mounted loader refetches', async () => {
  const cache = new QueryCache({ defaultConfig: { queries: { retry: false, staleTime: Infinity } } });
  const key = ['single-review', { id: 'approved-task' }];
  cache.setQueryData(key, { task: { status: 3 }, review: null });
  const loader = jest.fn().mockResolvedValue({ task: { status: 3, name: 'Refreshed task' }, review: null });
  const observer = cache.watchQuery(key, loader, { refetchOnMount: false, staleTime: Infinity });
  const unsubscribe = observer.subscribe(() => undefined);
  try {
    expect(loader).not.toHaveBeenCalled();
    expect(cache.getQuery(key)?.config.queryFn).not.toBe(loader);
    await markCorrectionQueriesStale(cache);
    expect(cache.getQuery(key)?.state.status).toBe('success');
    expect(cache.getQuery(key)?.state.error).toBeNull();
    expect(cache.getQuery(key)?.state.isInvalidated).toBe(true);
    expect(loader).not.toHaveBeenCalled();
    await observer.refetch({ throwOnError: true });
    expect(loader).toHaveBeenCalledTimes(1);
    expect(cache.getQuery(key)?.state.status).toBe('success');
    expect(cache.getQueryData(key)).toEqual({ task: { status: 3, name: 'Refreshed task' }, review: null });
  } finally {
    unsubscribe();
    cache.clear();
  }
});
