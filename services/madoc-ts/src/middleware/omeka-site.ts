import { RouteMiddleware } from '../types/route-middleware';
import { api } from '../gateway/api.server';
import { NotFound } from '../utility/errors/not-found';

export const omekaSite: RouteMiddleware = async (context, next) => {
  if (context.params && typeof context.params.slug !== 'undefined') {
    const userId = context.state.jwt ? context.state.jwt.user.id : undefined;
    const isAdmin = context.state.jwt ? context.state.jwt.scope.indexOf('site.admin') !== -1 : false;
    const site = await context.omeka.getSiteIdBySlug(context.params.slug, userId, isAdmin);
    if (!site) {
      throw new NotFound();
    }
    context.state.site = site;
    context.state.siteApi = api.asUser({ siteId: site.id, userId: userId });
  }
  await next();
};
