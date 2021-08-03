import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const getSiteUsers: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  context.response.body = { users: await context.siteManager.getSiteUsers(siteId) };
};
