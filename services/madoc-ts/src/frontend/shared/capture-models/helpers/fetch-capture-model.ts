import { CaptureModel } from '../types/capture-model';

export async function fetchCaptureModel(captureModelId?: string, captureModel?: CaptureModel): Promise<CaptureModel> {
  if (captureModel) {
    return captureModel;
  }

  if (captureModelId) {
    // @todo validation of incoming JSON.
    return (await (await fetch(captureModelId)).json()) as CaptureModel;
  }

  throw new Error('You must provide either a captureModel or captureModelId');
}
