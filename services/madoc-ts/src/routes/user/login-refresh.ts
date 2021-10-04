import { UserSite } from '../../extensions/site-manager/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { getJwtCookies } from '../../utility/get-jwt-cookies';

export const loginRefresh: RouteMiddleware = async context => {
  if (context.query.redirect && !context.query.redirect.startsWith('/')) {
    context.query.redirect = '';
  }

  // If we don't have a JWT, then redirect.
  if (!context.state.jwt || !context.state.jwt.user.id) {
    if (context.query.redirect === `/s/${context.params.slug}/login`) {
      context.query.redirect = `/s/${context.params.slug}`;
    }
    context.response.redirect(`/s/${context.params.slug}/login?redirect=${context.query.redirect}`);
    return;
  }

  const siteCookies = context.cookies.get('madoc-sites') || '';
  const sites = siteCookies.split(',');
  const userResp = await context.siteManager.getUserAndSites(context.state.jwt.user.id);

  if (!userResp) {
    context.response.redirect(`/s/${context.params.slug}/login`);
    return;
  }

  const siteIds = userResp.sites.map(site => site.slug);
  const missingSites: UserSite[] = [];
  for (const site of userResp.sites) {
    if (sites.indexOf(site.slug) === -1) {
      missingSites.push(site);
    }
  }

  if (missingSites.length) {
    const { cookiesToAdd } = await getJwtCookies(context, {
      id: userResp.user.id,
      name: userResp.user.name,
      role: userResp.user.role,
      sites: missingSites,
    });

    for (const cookie of cookiesToAdd) {
      context.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    context.cookies.set('madoc-sites', siteIds.join(','), {
      overwrite: true,
      signed: true,
      httpOnly: false,
    });
  }

  context.response.redirect(context.query.redirect || `/s/${context.params.slug}`);
};
