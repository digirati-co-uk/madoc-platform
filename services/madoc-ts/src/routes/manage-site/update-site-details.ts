import { UpdateSiteRequest } from '../../extensions/site-manager/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';
import { RequestError } from '../../utility/errors/request-error';

export const updateSiteDetails: RouteMiddleware<unknown, Partial<UpdateSiteRequest>> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const footerLinksInNewTab = context.requestBody.config?.footerLinksInNewTab;
  if (footerLinksInNewTab !== undefined && typeof footerLinksInNewTab !== 'boolean') {
    throw new RequestError('Footer link target must be a boolean');
  }

  context.response.body = await context.siteManager.updateSite(siteId, context.requestBody);
};
