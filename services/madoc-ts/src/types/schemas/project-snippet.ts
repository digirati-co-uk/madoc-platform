import { InternationalString } from '@iiif/presentation-3';

export type ProjectSnippet = {
  id: number;
  label: InternationalString;
  summary: InternationalString;
  thumbnail?: string;
};
