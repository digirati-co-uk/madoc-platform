import { MetadataDefinition } from './metadata-definition';

export type MetadataUpdate = {
  added: MetadataDefinition[];
  removed: number[];
  modified: MetadataDefinition[];
};
