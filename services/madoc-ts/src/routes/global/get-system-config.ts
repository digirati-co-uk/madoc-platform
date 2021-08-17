import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const getSystemConfig: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  context.response.body = await context.siteManager.getSystemConfig(false);
};
