import { RouteMiddleware } from '../../types/route-middleware';

export const sitePages: RouteMiddleware<{ paths?: string }> = async context => {
  const { site } = context.state;
  const pathToFind = context.params.paths ? `/${context.params.paths}` : '/';

  const root = await context.pageBlocks.getNavigationRoot(pathToFind, site.id);

  try {
    context.response.body = {
      page: await context.pageBlocks.getPageByPath(pathToFind, site.id),
      root,
      navigation: root ? await context.pageBlocks.getPageNavigation(root.path, site.id) : [],
    };
    context.response.status = 200;
  } catch (e) {
    // This case we just return empty.
    context.response.body = {
      page: undefined,
      root,
      navigation: root ? await context.pageBlocks.getPageNavigation(root.path, site.id) : [],
    };
  }
};

export const getStaticPage: RouteMiddleware = async context => {
  const { site } = context.state;

  const pathToFind = context.params.paths ? `/${context.params.paths}` : '/';

  const root = await context.pageBlocks.getNavigationRoot(pathToFind, site.id);

  try {
    context.response.body = {
      page: await context.pageBlocks.getPageByPath(pathToFind, site.id),
      root,
      navigation: root ? await context.pageBlocks.getPageNavigation(root.path, site.id) : [],
    };
    context.response.status = 200;
  } catch (e) {
    // This case we just return empty.
    context.response.body = {
      page: undefined,
      root,
      navigation: root ? await context.pageBlocks.getPageNavigation(root.path, site.id) : [],
    };
  }
};
