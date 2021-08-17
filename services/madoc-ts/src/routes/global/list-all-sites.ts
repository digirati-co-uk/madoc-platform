import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const listAllSites: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  const [sites, siteStats] = await Promise.all([
    context.siteManager.listAllSites(),
    context.siteManager.getSiteStatistics(),
  ]);

  context.response.body = { sites, siteStats };
};
