import { InternationalString } from '@iiif/presentation-3';

export type CreateProject = {
  label: InternationalString;
  summary: InternationalString;
  slug: string;
  template?: string;
  template_options?: unknown;
  template_config?: unknown;
  remote_template?: unknown | null;
  duplicate_project_id?: number | string;
};
