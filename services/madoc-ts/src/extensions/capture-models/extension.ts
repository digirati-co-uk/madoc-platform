import { CaptureModel } from '@capture-models/types';
import { BaseExtension } from '../extension-manager';

export interface CaptureModelExtension extends BaseExtension {
  onCloneCaptureModel(captureModel: CaptureModel): Promise<CaptureModel>;
}
