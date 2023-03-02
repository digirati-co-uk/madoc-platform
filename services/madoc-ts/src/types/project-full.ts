import { InternationalString } from '@iiif/presentation-3';
import { ProjectTemplate, ProjectTemplateConfig } from '../extensions/projects/types';
import { AnnotationStyles } from './annotation-styles';
import { ProjectConfiguration } from './schemas/project-configuration';

export type Project<Template extends ProjectTemplate = never> = {
  id: number;
  collection_id: number;
  slug: string;
  capture_model_id: string;
  task_id: string;
  label: InternationalString;
  summary: InternationalString;
  style_id?: number | null;
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
  annotationTheme?: AnnotationStyles['theme'] | null;
};
