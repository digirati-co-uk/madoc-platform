import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { userWithScope } from '../../utility/user-with-scope';
import { migrateModel } from '../migration/migrate-model';

export const updateCaptureModelApi: RouteMiddleware<{ id: string }, CaptureModel> = async context => {
  const { siteId, id } = userWithScope(context, ['models.create']);

  const body = context.requestBody;

  if (!body.id) {
    throw new RequestError(`Capture model requires ID to save`);
  }

  await migrateModel(body.id, { id, siteId }, context.captureModels);

  context.response.body = await context.captureModels.updateCaptureModel(body, siteId);
};
