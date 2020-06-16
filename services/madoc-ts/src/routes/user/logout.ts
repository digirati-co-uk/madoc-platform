import { RouteMiddleware } from '../../types/route-middleware';

export const logout: RouteMiddleware<{ slug: string }> = async context => {
  const jwt = context.state.jwt;
  if (jwt && jwt.user.id) {
    const siteCookies = context.cookies.get('madoc-sites');
    if (!siteCookies) {
      return;
    }
    const sites = siteCookies.split(',');
    const cookieName = context.externalConfig.cookieName || 'madoc';
    // // Get user sites
    // const sites = await context.omeka.getUserSites(jwt.user.id, 'admin'); // @todo change this to avoid leaking sites
    // Unset cookies.
    for (const site of sites) {
      const domain = `/s/${site}`;
      context.cookies.set(`${cookieName}/${site}`, '', {
        path: domain,
        signed: true,
        expires: new Date(Date.parse('0')),
        overwrite: true,
      });
    }
  }

  // Redirect to Omeka.
  context.response.redirect(
    `/s/${context.params.slug}/logout${context.query.redirect ? `?redirect=${context.query.redirect}` : ''}`
  );
};
