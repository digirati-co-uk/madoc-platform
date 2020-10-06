import { InternationalString } from '@hyperion-framework/types';

export type ProjectListItem = {
  id: number;
  collection_id: number;
  slug: string;
  capture_model_id: string;
  task_id: string;
  label: InternationalString;
  summary: InternationalString;
  status: number;
};
