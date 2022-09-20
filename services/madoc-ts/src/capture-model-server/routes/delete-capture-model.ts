import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteCaptureModelApi: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const modelId = context.params.id;

  try {
    await context.captureModels.deleteCaptureModel(modelId, siteId);
  } catch (e) {
    //
  }

  context.status = 204;
};
