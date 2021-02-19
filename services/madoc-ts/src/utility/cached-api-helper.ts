import { ApiClient } from '../gateway/api';
import cache from 'memory-cache';

export type CachedApiHelper = <T>(
  cacheKey: string,
  time: number,
  callback: (apiInstance: ApiClient) => Promise<T>
) => Promise<T>;

export function cachedApiHelper(api: ApiClient, siteId: number): CachedApiHelper {
  return async <T>(cacheKey: string, time: number, callback: (apiInstance: ApiClient) => Promise<T>): Promise<T> => {
    const fullKey = `cah:${siteId}:${cacheKey}`;
    const cached = cache.get(fullKey);

    if (cached) {
      return cached as any;
    }

    const freshValue = await callback(api);

    cache.put(fullKey, freshValue, time);

    return freshValue;
  };
}
