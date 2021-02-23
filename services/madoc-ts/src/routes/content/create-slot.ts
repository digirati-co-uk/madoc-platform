import { RouteMiddleware } from '../../types/route-middleware';
import { CreateSlotRequest } from '../../types/schemas/site-page';
import { userWithScope } from '../../utility/user-with-scope';

export const createSlot: RouteMiddleware<{}, CreateSlotRequest> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const slotReq = context.requestBody;

  context.response.body = await context.pageBlocks.createSlot(slotReq, siteId);
  context.response.status = 201;
};
