import { MetadataDefinition } from './metadata-definition';

export type GetMetadata = {
  fields: Array<MetadataDefinition & { id: number }>;
  template?: string[];
};
