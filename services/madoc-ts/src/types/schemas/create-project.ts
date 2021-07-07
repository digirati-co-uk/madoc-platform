import { InternationalString } from '@hyperion-framework/types';

export type CreateProject = {
  label: InternationalString;
  summary: InternationalString;
  slug: string;
  template?: string;
  template_options?: any;
};
