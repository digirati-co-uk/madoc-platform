import { RouteMiddleware } from '../../types';

export const logout: RouteMiddleware<{ slug: string }> = async context => {
  const jwt = context.state.jwt;
  if (jwt) {
    const user = jwt.user;
    const cookieName = context.externalConfig.cookieName || 'madoc';
    // Get user sites
    const sites = await context.omeka.getUserSites(user.id);
    // Unset cookies.
    for (const site of sites) {
      const domain = `/s/${site.slug}`;
      context.cookies.set(`${cookieName}/${site.slug}`, '', {
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
