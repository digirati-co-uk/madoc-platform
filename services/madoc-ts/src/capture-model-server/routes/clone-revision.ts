import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const cloneRevisionApi: RouteMiddleware<{ captureModelId: string; revisionId: string }> = async context => {
  const { id, siteId } = userWithScope(context, ['models.create']);

  const captureModelId = context.params.captureModelId;
  const revisionId = context.params.revisionId;

  context.response.body = await context.captureModels.cloneRevision(captureModelId, revisionId, siteId, id);
};
