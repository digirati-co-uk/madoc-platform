import deepmerge from 'deepmerge';
import { CaptureModel } from '../types/capture-model';
import { isEntity } from './is-entity';
import { generateId } from './generate-id';

export function hydrateCaptureModel<T = any>(
  doc: CaptureModel['document'],
  json: T,
  config: { keepExtraFields?: boolean } = {}
) {
  const { keepExtraFields = false } = config;
  const properties = Object.keys(doc.properties);
  const newDoc: CaptureModel['document'] = {
    ...doc,
    id: generateId(),
    properties: {},
  };
  if (newDoc.selector) {
    newDoc.selector.id = generateId();
  }
  for (const prop of properties) {
    const jsonValue = typeof (json as any)[prop] === 'undefined' ? [] : (json as any)[prop];
    const values = Array.isArray(jsonValue) ? jsonValue : [jsonValue];
    const modelTemplates = doc.properties[prop];
    const modelTemplate = modelTemplates ? modelTemplates[0] : undefined;

    // Ignore properties that don't exist.
    if (!modelTemplate) continue;

    if (values.length === 0) {
      if (keepExtraFields) {
        newDoc.properties[prop] = [
          {
            ...modelTemplate,
            id: generateId(),
          } as any,
        ];
      }
      continue;
    }

    if (isEntity(modelTemplate)) {
      newDoc.properties[prop] = values.map((value: any) => {
        return hydrateCaptureModel(deepmerge({}, modelTemplate), value, config);
      }) as any;
    } else {
      newDoc.properties[prop] = values.map((value: any) => {
        return {
          ...modelTemplate,
          id: generateId(),
          value,
          selector: undefined, // @todo come back to selectors.
        };
      });
    }
  }

  return newDoc;
}
