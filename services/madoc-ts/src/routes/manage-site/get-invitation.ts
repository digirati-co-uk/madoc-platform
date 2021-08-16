import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const getInvitation: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  context.response.body = await context.siteManager.getInvitation(context.params.invitationId, siteId);
};
