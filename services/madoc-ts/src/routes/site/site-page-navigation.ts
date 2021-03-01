import { RouteMiddleware } from '../../types/route-middleware';

export const sitePageNavigation: RouteMiddleware<{ paths?: string }> = async context => {
  const { site } = context.state;
  const paths = context.params.paths;
  const pages = await context.pageBlocks.getPageNavigation(paths, site.id);

  context.response.body = {
    navigation: pages,
  };
};
