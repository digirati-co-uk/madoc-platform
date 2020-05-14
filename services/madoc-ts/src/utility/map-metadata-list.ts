import { setValueDotNotation } from './iiif-metadata';
import { MetadataDefinition } from '../types/schemas/metadata-definition';
import { GetMetadata } from '../types/schemas/get-metadata';

export type ParsedMetadata = {
  [key: string]: { type: 'values'; items: Array<{ id: number } & MetadataDefinition> } | ParsedMetadata[];
};

export function mapMetadataList(metadata: GetMetadata) {
  const toReturn: ParsedMetadata = {};

  for (const metadataItem of metadata.fields) {
    setValueDotNotation(toReturn, metadataItem.key, val => {
      if (!val.type) {
        val.type = 'values';
        val.items = [];
      }

      val.items.push(metadataItem);
    });
  }
  return toReturn;
}
