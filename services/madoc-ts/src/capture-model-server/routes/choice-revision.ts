import { createRevisionRequestFromStructure } from '../../frontend/shared/capture-models/helpers/create-revision-request';
import { findStructure } from '../../frontend/shared/capture-models/helpers/find-structure';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { migrateModel } from '../migration/migrate-model';

export const choiceRevisionApi: RouteMiddleware<{ captureModelId: string; structureId: string }> = async context => {
  const { id, siteId } = optionalUserWithScope(context, ['models.contribute']);
  const modelId = context.params.captureModelId;

  // Migration specific.
  await migrateModel(modelId, { id, siteId }, context.captureModels);

  const captureModel = await context.captureModels.getCaptureModel(
    modelId,
    {
      userId: id,
    },
    siteId
  );

  if (!captureModel) {
    context.status = 404;
    return;
  }

  const foundStructure = findStructure(captureModel, context.params.structureId);
  if (!foundStructure) {
    context.status = 404;
  }

  context.response.body = createRevisionRequestFromStructure(captureModel, foundStructure as any);
};
