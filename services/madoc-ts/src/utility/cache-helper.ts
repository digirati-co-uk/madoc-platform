import cache from 'memory-cache';

export async function cachePromise<T extends object>(
  key: string,
  getter: () => Promise<T>,
  timeInMs: number
): Promise<T> {
  const resource = cache.get(key);
  if (resource) {
    return resource as T;
  }

  const result = await getter();
  cache.put(key, result, timeInMs);
  return result;
}

const swrPromises = new Map<string, Promise<object | null>>();
const DEFAULT_STALE_TIME = 1000 * 60 * 60 * 8; // 8 hours

export async function cachePromiseSWR<T extends object | null>(
  key: string,
  getter: () => Promise<T>,
  timeInMs: number,
  staleTimeInMs: number = DEFAULT_STALE_TIME
): Promise<T> {
  const resource = cache.get(key) as T | null;
  if (resource) {
    return resource;
  }

  const staleResource = cache.get(`@stale/${key}`) as T | null;
  let promise = swrPromises.get(key) as Promise<T> | undefined;
  if (!promise) {
    promise = getter()
      .then(result => {
        cache.put(key, result, timeInMs);
        cache.put(`@stale/${key}`, result, staleTimeInMs);
        return result;
      })
      .finally(() => swrPromises.delete(key));
    swrPromises.set(key, promise);
  }

  if (staleResource) {
    void promise.catch(() => undefined);
    return staleResource;
  }

  return promise;
}
