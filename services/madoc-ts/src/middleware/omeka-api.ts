import { SiteUserRepository } from '../repository/site-user-repository';
import { OmekaApi } from '../utility/omeka-api';
import { RouteMiddleware } from '../types/route-middleware';

export const omekaApi: RouteMiddleware<{ slug: string }> = async (context, next) => {
  context.omeka = new OmekaApi(context.mysql);
  context.siteManager = new SiteUserRepository(context.connection, context.omeka, 'HYBRID_OMEKA');
  await next();
};
