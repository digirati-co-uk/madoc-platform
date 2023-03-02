import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteRevisionApi: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['models.create']);

  await context.captureModels.deleteRevision(context.params.id, siteId);

  context.status = 204;
};
