import { ProjectConfiguration } from './schemas/project-configuration';
import { CaptureModel } from '@capture-models/types';

export type ProjectExportFull = {
  templateName: string;
  config: Partial<ProjectConfiguration>;
  captureModel: CaptureModel;
};
