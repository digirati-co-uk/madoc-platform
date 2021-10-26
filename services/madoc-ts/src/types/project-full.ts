import { InternationalString } from '@hyperion-framework/types';
import { ProjectTemplate, ProjectTemplateConfig } from '../extensions/projects/types';
import { ProjectConfiguration } from './schemas/project-configuration';

export type Project<Template extends ProjectTemplate = never> = {
  id: number;
  collection_id: number;
  slug: string;
  capture_model_id: string;
  task_id: string;
  label: InternationalString;
  summary: InternationalString;
  template?: Template['type'];
  template_config?: ProjectTemplateConfig<Template>;
  status: number;
};

export type ProjectFull<Template extends ProjectTemplate = never> = Project<Template> & {
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
