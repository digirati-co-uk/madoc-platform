import fetch from 'node-fetch';
import { RouteMiddleware } from '../../types/route-middleware';

const omekaUrl = process.env.OMEKA__URL as string;

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

  if (context.query.redirect && !context.query.redirect.startsWith('/')) {
    context.query.redirect = '';
  }

  // Automatic logout of Omeka:
  await fetch(`${omekaUrl}/logout`, {
    headers: {
      Cookie: context.req.headers.cookie ? context.req.headers.cookie.toString() : '',
      // Authorization: context.state.jwt ? `Bearer ${context.state.jwt.token}` : '',
    },
  });

  // Redirect to Omeka.
  context.response.redirect(context.query.redirect || `/s/${context.params.slug}`);
};
