import { RouteMiddleware } from '../../types/route-middleware';
import { SiteBlockRequest } from '../../types/schemas/site-page';
import { userWithScope } from '../../utility/user-with-scope';

export const createBlock: RouteMiddleware<{ slotId?: string }, SiteBlockRequest> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const blockReq = context.requestBody;
  const slotId = context.params.slotId ? Number(context.params.slotId) : undefined;

  context.response.body = await context.pageBlocks.createBlock(blockReq, siteId, slotId);
  context.response.status = 201;
};
