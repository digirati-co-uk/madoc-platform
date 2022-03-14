import { CaptureModel } from '../types/capture-model';
import { generateId } from './generate-id';

export function captureModelShorthand(shorthand: { [key: string]: string | any }): CaptureModel['document'] {
  const model: CaptureModel['document'] = {
    id: generateId(),
    type: 'entity',
    label: 'Root',
    properties: {},
  };

  const metadata = shorthand;
  const originalKeys = Object.keys(shorthand);

  const processLevel = (doc: CaptureModel['document'], key: string[], originalKey: string) => {
    if (key.length === 0) {
      return;
    }
    if (key.length === 1) {
      // Add a field.

      const metadataValue = metadata[originalKey];
      if (typeof metadataValue !== 'string' && !metadataValue.type) {
        // If there's no type, we can't make a field.
        return;
      }

      doc.properties[key[0]] = [
        typeof metadataValue === 'string'
          ? {
              id: generateId(),
              label: key[0], // @todo config for mapping fields to labels.
              type: metadataValue,
              value: null,
            }
          : ({
              id: generateId(),
              type: metadataValue.type,
              label: key[0], // @todo config for mapping fields to labels.
              value: null,
              ...metadataValue,
            } as any),
      ];
      return;
    }

    const templateEntity =
      doc.properties[key[0]] && doc.properties[key[0]].length
        ? (doc.properties[key[0]][0] as any)
        : ({
            id: generateId(),
            type: 'entity',
            label: key[0], // @todo config for mapping fields to labels
            properties: {},
          } as CaptureModel['document']);

    // Recursion.
    processLevel(templateEntity, key.slice(1), originalKey);
    // Finally add the entity to the field.
    doc.properties[key[0]] = [templateEntity];
  };

  for (let i = 0; i < originalKeys.length; i++) {
    const originalKey = originalKeys[i];
    const splitKey = originalKey.split('.');

    processLevel(model, splitKey, originalKey);
  }

  return model;
}
