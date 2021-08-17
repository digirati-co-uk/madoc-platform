import { SiteUserRepository } from '../repository/site-user-repository';
import { OmekaApi } from '../utility/omeka-api';
import { RouteMiddleware } from '../types/route-middleware';

export const omekaApi: RouteMiddleware<{ slug: string }> = async (context, next) => {
  context.siteManager = new SiteUserRepository(context.connection, new OmekaApi(context.mysql), 'HYBRID_POSTGRES');
  await next();
};
