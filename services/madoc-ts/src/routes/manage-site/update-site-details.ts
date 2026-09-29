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
  const accentColor = context.requestBody.config?.accentColor;
  if (accentColor !== undefined && (typeof accentColor !== 'string' || !/^#[0-9a-f]{6}$/i.test(accentColor))) {
    throw new RequestError('Site accent color must be a six-digit hex color');
  }

  context.response.body = await context.siteManager.updateSite(siteId, context.requestBody);
};
