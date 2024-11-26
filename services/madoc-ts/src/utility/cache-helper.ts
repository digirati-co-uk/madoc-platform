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

const swcPromises: Record<string, Promise<any> | null> = {};
const DEFAULT_STALE_TIME = 1000 * 60 * 60 * 8; // 8 hours

export async function cachePromiseSWR<T extends object | null>(
  key: string,
  getter: () => Promise<T>,
  timeInMs: number,
  staleTimeInMs: number = DEFAULT_STALE_TIME
): Promise<T> {
  if (swcPromises[key]) {
    await swcPromises[key];
  }
  const resource = cache.get(key);
  const staleResource = cache.get(`@stale/${key}`);
  if (!resource) {
    const promise = getter();
    swcPromises[key] = promise;
    promise.then(result => {
      cache.put(key, result, timeInMs);
      cache.put(`@stale/${key}`, result, staleTimeInMs);

      delete swcPromises[key];

      return result;
    });

    if (staleResource) {
      return staleResource;
    }

    return promise;
  }

  return resource;
}
