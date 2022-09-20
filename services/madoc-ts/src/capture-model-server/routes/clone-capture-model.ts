import { Target } from '../../frontend/shared/capture-models/types/capture-model';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const cloneCaptureModel: RouteMiddleware<{ id: string }, { target: Target[] }> = async context => {
  const { siteId } = userWithScope(context, ['models.create']);

  const target = context.requestBody.target;
  const sourceModelId = context.params.id;

  context.response.body = await context.captureModels.cloneCaptureModel(sourceModelId, siteId, {
    target,
  });
};
