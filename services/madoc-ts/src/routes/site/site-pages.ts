import { RouteMiddleware } from '../../types/route-middleware';

export const sitePages: RouteMiddleware<{ paths?: string }> = async context => {
  const { site } = context.state;
  const pathToFind = `/${context.params.paths}`;

  console.log({ pathToFind });

  const root = await context.pageBlocks.getNavigationRoot(pathToFind, site.id);

  context.response.body = {
    page: await context.pageBlocks.getPageByPath(pathToFind, site.id),
    root,
    navigation: root ? await context.pageBlocks.getPageNavigation(root.path, site.id) : [],
  };
  context.response.status = 200;
};
