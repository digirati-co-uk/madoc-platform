import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { api } from '../../gateway/api.server';
import { CaptureModelRepository } from '../capture-model-repository';

export async function migrateModel(
  modelId: string | undefined,
  { id, siteId }: { id?: number; siteId: number },
  repo: CaptureModelRepository
) {
  if (repo.isMigrated() || !modelId) {
    return;
  }

  try {
    if (!(await repo.captureModelExists(modelId, siteId))) {
      const userApi = api.asUser({ siteId, userId: id });
      const model = await userApi.request<CaptureModel>(`/api/crowdsourcing/model/${modelId}`);
      await repo.createCaptureModel(model, siteId);
    }
  } catch (e) {
    console.log('CAPTURE MODEL MIGRATION ERROR', e);
  }
}
