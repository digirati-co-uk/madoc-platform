import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const getSiteUser: RouteMiddleware = async context => {
  const { siteId, id } = userWithScope(context, ['site.admin']);

  const userId = Number(context.params.userId);

  const response = await context.siteManager.getSiteUserById(userId, siteId);
  const details = await context.siteManager.requestUserDetails(userId, id, siteId, true);

  context.response.body = { user: response, details: details.allowedDetails };
};
