import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const listInvitations: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  context.response.body = { invitations: await context.siteManager.getInvitations(siteId) };
};
