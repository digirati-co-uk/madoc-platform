import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const getPageNavigation: RouteMiddleware<{ paths?: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const paths = context.params.paths;
  const pages = await context.pageBlocks.getPageNavigation(paths, siteId);

  context.response.body = {
    navigation: pages,
  };
};
