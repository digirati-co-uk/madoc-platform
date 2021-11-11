import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deletePage: RouteMiddleware<{ paths: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const pathToFind = `/${context.params.paths}`;

  await context.pageBlocks.deletePage(pathToFind, siteId);

  context.response.status = 204;
};
