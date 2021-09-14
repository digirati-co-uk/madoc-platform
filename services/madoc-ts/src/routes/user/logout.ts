import fetch from 'node-fetch';
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

  if (context.query.redirect && !context.query.redirect.startsWith('/')) {
    context.query.redirect = '';
  }

  // Redirect to site homepage.
  context.response.redirect(context.query.redirect || `/s/${context.params.slug}`);
};
