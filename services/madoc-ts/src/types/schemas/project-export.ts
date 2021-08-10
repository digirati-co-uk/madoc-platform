import { ProjectConfiguration } from './project-configuration';

export type ProjectExport = {
  templateName: string;
  config: Partial<ProjectConfiguration>;
  capture_model_id: string;
};
