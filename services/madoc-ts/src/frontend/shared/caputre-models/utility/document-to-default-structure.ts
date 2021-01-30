import { mergeFlatKeys } from '@capture-models/editor';
import { isEntity } from '@capture-models/helpers';
import { CaptureModel } from '@capture-models/types';

export function documentToDefaultFlatKeys(document: CaptureModel['document'], propertyPath: string[] = []): string[][] {
  const keys: string[][] = [];
  for (const property of Object.keys(document.properties)) {
    const value = document.properties[property][0];
    if (value) {
      if (isEntity(value)) {
        keys.push(...documentToDefaultFlatKeys(value, [...propertyPath, property]));
      } else {
        keys.push([...propertyPath, property]);
      }
    }
  }

  return keys;
}

export function documentToDefaultStructure(document: CaptureModel['document']) {
  return mergeFlatKeys(documentToDefaultFlatKeys(document));
}
