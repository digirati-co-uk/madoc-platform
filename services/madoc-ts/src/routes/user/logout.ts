import { RouteMiddleware } from '../../types/route-middleware';

export const logout: RouteMiddleware<{ slug: string }> = async context => {
  const cookieName = context.externalConfig.cookieName || 'madoc';
  const siteCookies = context.cookies.get('madoc-sites');
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
      expires: new Date(Date.parse('0')),
      overwrite: true,
    });
  }

  // Unset the site index cookie too, so we don't keep stale site ids around.
  context.cookies.set('madoc-sites', '', {
    path: '/',
    signed: true,
    expires: new Date(Date.parse('0')),
    overwrite: true,
  });

  const requestedRedirect = Array.isArray(context.query.redirect) ? context.query.redirect[0] : context.query.redirect;
  const safeRedirect = requestedRedirect && requestedRedirect.startsWith('/') ? requestedRedirect : '';

  // Default to login so private sites don't bounce users to a not-found homepage after logout.
  context.response.redirect(safeRedirect || `/s/${context.params.slug}/login`);
};
