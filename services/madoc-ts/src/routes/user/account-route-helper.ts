export const ACCOUNT_PATH_PREFIX = '/account';
export const SITE_PATH_PREFIX = '/s';
export const ACCOUNT_SITE_QUERY_PARAM = 'site';

export function isAccountRequestPath(pathname: string) {
  return pathname.startsWith(`${ACCOUNT_PATH_PREFIX}/`);
}

export function getAuthPathPrefix(slug: string, accountRequest: boolean) {
  return `${accountRequest ? ACCOUNT_PATH_PREFIX : SITE_PATH_PREFIX}/${slug}`;
}

export function getFirstQueryValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function buildAccountEntryPath(path: string, siteSlug: string, query?: URLSearchParams) {
  const params = query ? new URLSearchParams(query) : new URLSearchParams();
  params.set(ACCOUNT_SITE_QUERY_PARAM, siteSlug);
  const queryString = params.toString();
  return `${ACCOUNT_PATH_PREFIX}/${path}${queryString ? `?${queryString}` : ''}`;
}
