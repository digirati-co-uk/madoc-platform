import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { userWithScope } from '../../utility/user-with-scope';

export const createCaptureModelApi: RouteMiddleware<any, CaptureModel> = async context => {
  const { siteId } = userWithScope(context, ['models.admin']);

  const body = context.requestBody;

  if (!body.id) {
    throw new RequestError(`Capture model requires ID to save`);
  }

  // @todo capture model exists.
  // if (await context.db.api.captureModelExists(body.id)) {
  //   throw new RequestError('Capture model already exists');
  // }

  context.response.body = await context.captureModels.createCaptureModel(body, siteId);
};
