import { RouteMiddleware } from '../../types/route-middleware';
import { getAuthPathPrefix, isAccountRequestPath } from './account-route-helper';

const DEFAULT_COOKIE_NAME = 'madoc';
const SITES_COOKIE_NAME = 'madoc-sites';
const EXPIRED_DATE = new Date(0);

export const logout: RouteMiddleware<{ slug: string }> = async context => {
  const accountRequest = isAccountRequestPath(context.path);
  const cookieName = context.externalConfig.cookieName || DEFAULT_COOKIE_NAME;
  const siteCookies = context.cookies.get(SITES_COOKIE_NAME);
  const sites = siteCookies
    ? siteCookies
        .split(',')
        .map(site => site.trim())
        .filter(Boolean)
    : [context.params.slug];

  // Unset per-site JWT cookies.
  for (const site of sites) {
    const domain = `/s/${site}`;
    context.cookies.set(`${cookieName}/${site}`, '', {
      path: domain,
      signed: true,
      expires: EXPIRED_DATE,
      overwrite: true,
    });
  }

  // Unset the site index cookie too, so we don't keep stale site ids around.
  context.cookies.set(SITES_COOKIE_NAME, '', {
    path: '/',
    signed: true,
    expires: EXPIRED_DATE,
    overwrite: true,
  });

  const requestedRedirect = Array.isArray(context.query.redirect) ? context.query.redirect[0] : context.query.redirect;
  const safeRedirect = requestedRedirect && requestedRedirect.startsWith('/') ? requestedRedirect : '';
  const authPathPrefix = getAuthPathPrefix(context.params.slug, accountRequest);

  // Redirect to site homepage.
  context.response.redirect(safeRedirect || (accountRequest ? `${authPathPrefix}/login` : `${authPathPrefix}`));
};
