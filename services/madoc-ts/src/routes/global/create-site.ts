import { CreateSiteRequest } from '../../extensions/site-manager/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const createSite: RouteMiddleware<unknown, CreateSiteRequest> = async context => {
  const { id: userId } = userWithScope(context, ['site.admin']);

  const site = await context.siteManager.createSite(context.requestBody, userId, context.externalConfig.permissions);

  await context.siteManager.setUsersRoleOnSite(site.id, userId, 'admin');

  context.response.body = {
    site,
  };
};
