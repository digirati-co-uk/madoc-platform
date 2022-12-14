import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const getAutomatedUsers: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.view']);

  context.response.body = { users: await context.siteManager.getAutomatedUsers(siteId) };
};
