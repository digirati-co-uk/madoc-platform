import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const modelApiMigration: RouteMiddleware = async context => {
  const { siteId, id } = optionalUserWithScope(context, ['site.admin']);

  const modelId = context.params.id;

  const exists = await context.captureModels.captureModelExists(modelId, siteId);

  if (context.request.method === 'GET') {
    context.response.body = { complete: exists };
    return;
  }

  if (!exists) {
    // Migrate the model.
    const userApi = api.asUser({ siteId, userId: id });
    const model = await userApi.request<CaptureModel>(`/api/crowdsourcing/model/${context.params.id}`);
    await context.captureModels.createCaptureModel(model, siteId);

    context.response.body = { complete: true, migrated: true };
  }

  context.response.body = { complete: true, migrated: false };
};
