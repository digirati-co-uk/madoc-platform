import { createRevisionRequestFromStructure } from '../../frontend/shared/capture-models/helpers/create-revision-request';
import { findStructure } from '../../frontend/shared/capture-models/helpers/find-structure';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const choiceRevisionApi: RouteMiddleware<{ captureModelId: string; structureId: string }> = async context => {
  const { id, siteId } = optionalUserWithScope(context, ['models.contribute']);

  const captureModel = await context.captureModels.getCaptureModel(
    context.params.captureModelId,
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
