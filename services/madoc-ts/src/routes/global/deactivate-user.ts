import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deactivateUser: RouteMiddleware<{ userId: string }> = async context => {
  userWithScope(context, ['site.admin']);

  await context.siteManager.deactivateUser(Number(context.params.userId));

  context.response.status = 200;
};
