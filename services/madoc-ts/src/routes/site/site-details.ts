import { RouteMiddleware } from '../../types/route-middleware';

export const siteDetails: RouteMiddleware = async context => {
  const { site } = context.state;

  context.response.body = await context.siteManager.getSiteById(site.id);
};
