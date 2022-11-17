import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';

export type ManualAction = {
  label: string;
  action: string;
  form?: CaptureModel['document'];
};

export interface ManualActions {
  getManualActions(): Promise<ManualAction[]>;

  handleManualAction(action: string, data?: any): Promise<void>;
}
