import { siteState } from '../../middleware/site-state';
import { RouteMiddleware } from '../../types/route-middleware';
import { buildAccountEntryPath } from '../user/account-route-helper';

const REDIRECT_QUERY_PARAM = 'redirect';

export const siteFrontendAccess: RouteMiddleware<{ slug: string }> = async (context, next) => {
  if (!context.state.jwt) {
    const site = await context.siteManager.getSiteBySlug(context.params.slug).catch(() => undefined);
    if (site && !site.is_public) {
      const query = new URLSearchParams();
      const requestedPath = `${context.path}${context.querystring ? `?${context.querystring}` : ''}`;
      query.set(REDIRECT_QUERY_PARAM, requestedPath);
      context.redirect(buildAccountEntryPath('login', site.slug, query));
      return;
    }
  }

  await siteState(context, next);
};
