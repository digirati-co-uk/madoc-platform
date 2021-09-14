import { SiteUserRepository } from '../repository/site-user-repository';
import { RouteMiddleware } from '../types/route-middleware';

export const siteManager: RouteMiddleware<{ slug: string }> = async (context, next) => {
  context.siteManager = new SiteUserRepository(context.connection);
  await next();
};
