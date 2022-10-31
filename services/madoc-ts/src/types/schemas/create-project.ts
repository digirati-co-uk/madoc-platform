import { InternationalString } from '@iiif/presentation-3';

export type CreateProject = {
  label: InternationalString;
  summary: InternationalString;
  slug: string;
  template?: string;
  template_options?: any;
  template_config?: any;
  remote_template?: any | null;
};
