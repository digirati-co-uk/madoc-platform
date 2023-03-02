import { Target } from '../../frontend/shared/capture-models/types/capture-model';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';
import { migrateModel } from '../migration/migrate-model';

export const cloneCaptureModel: RouteMiddleware<{ id: string }, { target: Target[] }> = async context => {
  const { siteId, id } = userWithScope(context, ['models.create']);

  const target = context.requestBody.target;
  const sourceModelId = context.params.id;

  // Migration specific.
  await migrateModel(sourceModelId, { id, siteId }, context.captureModels);

  context.response.body = await context.captureModels.cloneCaptureModel(sourceModelId, siteId, {
    target,
  });
};
