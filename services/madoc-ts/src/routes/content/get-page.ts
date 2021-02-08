import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const getPage: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.read']);
  const pathToFind = `/${context.params.paths}`;

  context.response.body = await context.pageBlocks.getPageByPath(pathToFind, siteId);
  context.response.status = 200;
};
