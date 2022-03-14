import { mergeFlatKeys } from '../editor/core/structure-editor';
import { isEntity } from '../helpers/is-entity';
import { CaptureModel } from '../types/capture-model';

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
