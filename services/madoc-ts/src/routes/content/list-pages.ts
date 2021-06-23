import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const getAllPages: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.view']);

  context.response.body = { pages: await context.pageBlocks.getAllPages(siteId) };
  context.response.status = 200;
};
