import cache from 'memory-cache';
import { ApiClient, ApiClientWithoutExtensions } from '../api';

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
  let siteSlug = siteId ? cache.get(`site-slug:${siteId}`) : null;

  if (!siteSlug) {
    const site = siteId ? await api.asUser({ userId, siteId }).getSiteDetails(siteId) : undefined;
    if (site) {
      siteSlug = site.slug;
      cache.put(`site-details:${siteId}`, siteSlug);
    }
  }

  if (withExtensions) {
    return api.asUser({ siteId, userId }, { siteSlug }, true);
  }
  return api.asUser({ siteId, userId }, { siteSlug });
}
