import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteUserSiteRole: RouteMiddleware<{ userId: string }, { site_role: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const userId = Number(context.params.userId);

  if (!userId || Number.isNaN(userId)) {
    throw new RequestError('Invalid user');
  }

  context.response.body = await context.siteManager.removeUserRoleOnSite(siteId, userId);
};
