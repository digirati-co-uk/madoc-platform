import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteSlot: RouteMiddleware<{ slotId: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const slotId = Number(context.params.slotId);

  await context.pageBlocks.deleteSlot(slotId, siteId);

  context.response.status = 204;
};
