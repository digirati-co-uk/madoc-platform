import { InternationalString } from '@hyperion-framework/types';
import { ProjectConfiguration } from './project-configuration';

export type ProjectFull = {
  id: number;
  collection_id: number;
  slug: string;
  capture_model_id: string;
  task_id: string;
  label: InternationalString;
  summary: InternationalString;
  template?: string;
  status: number;
  statistics: {
    0: number;
    1: number;
    2: number;
    3: number;
  };
  content: {
    manifests: number;
    canvases: number;
  };
  config: Partial<ProjectConfiguration>;
};
