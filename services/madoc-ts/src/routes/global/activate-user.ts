import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const activateUser: RouteMiddleware<{ userId: string }> = async context => {
  userWithScope(context, ['site.admin']);

  await context.siteManager.activateUser(Number(context.params.userId));

  context.response.status = 200;
};
