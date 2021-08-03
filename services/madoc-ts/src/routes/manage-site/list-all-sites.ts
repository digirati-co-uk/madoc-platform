import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const listAllSites: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  context.response.body = { sites: await context.siteManager.listAllSites() };
};
