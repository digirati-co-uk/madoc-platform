import { InternationalString } from '@hyperion-framework/types';

export type ProjectFull = {
  id: number;
  collection_id: number;
  slug: string;
  capture_model_id: string;
  task_id: string;
  label: InternationalString;
  summary: InternationalString;
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
  config: any;
};
