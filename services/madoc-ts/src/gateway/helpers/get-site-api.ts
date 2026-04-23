import cache from 'memory-cache';
import { ApiClient, ApiClientWithoutExtensions } from '../api';

const inFlightSiteSlugRequests = new Map<number, Promise<string | undefined>>();

function getSiteSlugCacheKey(siteId: number) {
  return `site-slug:${siteId}`;
}

async function getCachedSiteSlug(
  api: ApiClient,
  {
    siteId,
    userId,
  }: {
    siteId?: number;
    userId?: number;
  }
) {
  if (!siteId) {
    return undefined;
  }

  const cacheKey = getSiteSlugCacheKey(siteId);
  const cachedSiteSlug = cache.get(cacheKey);
  if (cachedSiteSlug) {
    return cachedSiteSlug;
  }

  const existingRequest = inFlightSiteSlugRequests.get(siteId);
  if (existingRequest) {
    return existingRequest;
  }

  const loadSiteSlug = (async () => {
    const site = await api.asUser({ userId, siteId }).getSiteDetails(siteId);
    const siteSlug = site?.slug;
    if (siteSlug) {
      cache.put(cacheKey, siteSlug);
    }
    return siteSlug;
  })();

  inFlightSiteSlugRequests.set(siteId, loadSiteSlug);

  try {
    return await loadSiteSlug;
  } finally {
    inFlightSiteSlugRequests.delete(siteId);
  }
}

export async function getSiteApi(
  api: ApiClient,
  user: { userId?: number; siteId?: number; userName?: string },
  withExtensions: true
): Promise<ApiClient>;
export async function getSiteApi(
  api: ApiClient,
  user: { userId?: number; siteId?: number; userName?: string }
): Promise<ApiClientWithoutExtensions>;
export async function getSiteApi(
  api: ApiClient,
  { siteId, userId }: { userId?: number; siteId?: number; userName?: string },
  withExtensions = false
) {
  const siteSlug = await getCachedSiteSlug(api, { siteId, userId });

  if (withExtensions) {
    return api.asUser({ siteId, userId }, { siteSlug }, true);
  }
  return api.asUser({ siteId, userId }, { siteSlug });
}
