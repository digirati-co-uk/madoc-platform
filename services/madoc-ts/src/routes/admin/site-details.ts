import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { userWithScope } from '../../utility/user-with-scope';

export const getSiteDetails: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const systemConfig = await context.siteManager.getSystemConfig();
  const site = await context.siteManager.getSiteById(siteId);

  site.config = {
    ...systemConfig,
    ...site.config,
  };

  if (!site || !site.slug) {
    throw new NotFound('Site not found');
  }

  context.response.body = site;
};
