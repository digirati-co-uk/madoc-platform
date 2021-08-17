import { UpdateInvitation } from '../../extensions/site-manager/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const updateInvitation: RouteMiddleware<{ invitationId: string }, UpdateInvitation> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const keys = Object.keys(context.requestBody);
  if (keys.length === 0) {
    context.response.body = await context.siteManager.getInvitation(context.params.invitationId, siteId);
  }

  context.response.body = await context.siteManager.updateInvitation(
    context.params.invitationId,
    siteId,
    context.requestBody
  );
};
