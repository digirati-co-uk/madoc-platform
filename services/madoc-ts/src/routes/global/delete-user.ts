import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteUser: RouteMiddleware<{ userId: string }> = async context => {
  const { id } = userWithScope(context, ['site.admin']);
  const toBeDeleted = Number(context.params.userId);

  if (toBeDeleted === id) {
    throw new RequestError('Cannot delete yourself');
  }

  await context.siteManager.deleteUser(toBeDeleted);

  context.response.status = 200;
};
