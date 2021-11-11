import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteBlock: RouteMiddleware<{ blockId: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const blockId = Number(context.params.blockId);

  await context.pageBlocks.deleteBlock(blockId, siteId);

  context.response.status = 204;
};
