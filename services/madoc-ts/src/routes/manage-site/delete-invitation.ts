import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteInvitation: RouteMiddleware<{ invitationId: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  await context.siteManager.deleteInvitation(context.params.invitationId, siteId);

  context.response.status = 200;
};
