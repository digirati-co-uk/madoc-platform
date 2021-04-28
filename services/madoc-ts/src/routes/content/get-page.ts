import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const getPage: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.read']);
  const pathToFind = context.params.paths ? `/${context.params.paths}` : '/';

  const root = await context.pageBlocks.getNavigationRoot(pathToFind, siteId);

  context.response.body = {
    page: await context.pageBlocks.getPageByPath(pathToFind, siteId),
    root,
    navigation: root ? await context.pageBlocks.getPageNavigation(root.path, siteId) : [],
  };
  context.response.status = 200;
};

export const getStaticPage: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.read']);
  const pathToFind = context.params.paths ? `/${context.params.paths}` : '/';

  const root = await context.pageBlocks.getNavigationRoot(pathToFind, siteId);

  try {
    context.response.body = {
      page: await context.pageBlocks.getPageByPath(pathToFind, siteId),
      root,
      navigation: root ? await context.pageBlocks.getPageNavigation(root.path, siteId) : [],
    };
    context.response.status = 200;
  } catch (e) {
    // This case we just return empty.
    context.response.body = {
      page: undefined,
      root,
      navigation: root ? await context.pageBlocks.getPageNavigation(root.path, siteId) : [],
    };
  }
};
