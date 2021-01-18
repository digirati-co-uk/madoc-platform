import { editBlock, mapBlock } from '../../database/queries/site-editorial';
import { RouteMiddleware } from '../../types/route-middleware';
import { SiteBlockRequest } from '../../types/schemas/site-page';
import { userWithScope } from '../../utility/user-with-scope';

export const updateBlock: RouteMiddleware<{ blockId: string }, SiteBlockRequest> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const blockId = Number(context.params.blockId);
  const changesToBlock = context.requestBody;

  const block = await context.connection.one(editBlock(blockId, changesToBlock, siteId));

  context.response.body = {
    block: mapBlock(block),
  };
};
