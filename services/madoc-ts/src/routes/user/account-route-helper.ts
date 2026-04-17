export const ACCOUNT_PATH_PREFIX = '/account';
export const SITE_PATH_PREFIX = '/s';

export function isAccountRequestPath(pathname: string) {
  return pathname.startsWith(`${ACCOUNT_PATH_PREFIX}/`);
}

export function getAuthPathPrefix(slug: string, accountRequest: boolean) {
  return `${accountRequest ? ACCOUNT_PATH_PREFIX : SITE_PATH_PREFIX}/${slug}`;
}
