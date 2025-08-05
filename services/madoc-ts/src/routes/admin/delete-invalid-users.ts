import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const deleteInvalidUsers: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  await context.siteManager.adminCleanUsers();

  context.response.status = 204;
};
