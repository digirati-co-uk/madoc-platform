import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { BaseExtension } from '../extension-manager';

export interface CaptureModelExtension extends BaseExtension {
  onCloneCaptureModel(captureModel: CaptureModel): Promise<CaptureModel>;
}
