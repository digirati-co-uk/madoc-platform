import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const getBlock: RouteMiddleware<{ blockId: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.read']);
  const blockId = Number(context.params.blockId);

  const block = await context.pageBlocks.getBlockById(blockId, siteId);

  context.response.body = {
    block,
  };
};
