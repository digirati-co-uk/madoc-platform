import { UpdateSiteRequest } from '../../extensions/site-manager/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const updateSiteDetails: RouteMiddleware<unknown, Partial<UpdateSiteRequest>> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  context.response.body = await context.siteManager.updateSite(siteId, context.requestBody);
};
