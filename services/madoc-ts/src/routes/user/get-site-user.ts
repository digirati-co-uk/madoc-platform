import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const getSiteUser: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const userId = Number(context.params.id);

  const response = await context.siteManager.getSiteUserById(userId, siteId);

  context.response.body = { user: response };
};
