import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';
import { migrateModel } from '../migration/migrate-model';

export const cloneRevisionApi: RouteMiddleware<{ captureModelId: string; revisionId: string }> = async context => {
  const { id, siteId } = userWithScope(context, ['models.create']);

  const captureModelId = context.params.captureModelId;
  const revisionId = context.params.revisionId;

  // Migration specific.
  await migrateModel(captureModelId, { id, siteId }, context.captureModels);

  context.response.body = await context.captureModels.cloneRevision(captureModelId, revisionId, siteId, id);
};
