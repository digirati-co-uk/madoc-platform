import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';
import { isEntity, isEntityList } from './is-entity';

function mergeProperties(docA: CaptureModel['document'], docB: CaptureModel['document']) {
  const propertiesA = Object.keys(docA.properties);
  const propertiesB = Object.keys(docB.properties);

  const mergedProperties = [];
  for (const propertyA of propertiesA) {
    if (propertiesB.indexOf(propertyA) !== -1) {
      // Nation. merge A into B
      const mergedValues = [...(docA.properties[propertyA] || []), ...(docB.properties[propertyA] || [])];
      if (isEntityList(mergedValues)) {
        // We need to merge.
        // - mapped entities by id for both A and B.
        const newProperties: {
          [key: string]: CaptureModel['document'] | BaseField;
        } = {};

        for (const instance of mergedValues) {
          const previouslyFoundEntity = newProperties[instance.id];

          if (previouslyFoundEntity) {
            if (isEntity(previouslyFoundEntity)) {
              mergeProperties(previouslyFoundEntity, instance);
            } else {
              // @todo error?
            }
          } else {
            newProperties[instance.id] = instance;
          }
          docA.properties[propertyA] = Object.values(newProperties) as any;
        }
      } else {
        const newProperties: {
          [key: string]: CaptureModel['document'];
        } = {};
        for (const instance of mergedValues) {
          // There should never be duplicates.
          newProperties[instance.id] = instance as any;
        }
        docA.properties[propertyA] = Object.values(newProperties);
      }
      mergedProperties.push(propertyA);
    }
  }

  if (propertiesB.length !== mergedProperties.length) {
    // We might have missed some.
    for (const propertyB of propertiesB) {
      if (mergedProperties.indexOf(propertyB) === -1) {
        docA.properties[propertyB] = docB.properties[propertyB];
      }
    }
  }
}

export function filterCaptureModel(
  id: string,
  document: CaptureModel['document'] | Omit<CaptureModel['document'], 'id'>,
  flatFields: string[][],
  predicate: (field: BaseField, parent: CaptureModel['document']) => boolean,
  postFilter?:
    | ((rootField: BaseField[], parent: CaptureModel['document']) => BaseField[])
    | Array<undefined | ((rootField: BaseField[], parent: CaptureModel['document']) => BaseField[])>
): CaptureModel['document'] | null {
  const newDocument: CaptureModel['document'] = {
    id,
    ...document,
    properties: {},
  };
  for (const [rootFieldKey, ...flatField] of flatFields) {
    const rootField = document.properties[rootFieldKey];
    if (!rootField) {
      console.warn(`Invalid root field ${rootFieldKey}`);
      continue;
    }
    // These are instances of the root field. The first field indicates the type
    for (const field of rootField) {
      if ((field as CaptureModel['document']).type === 'entity') {
        const filteredModel = filterCaptureModel(
          field.id,
          field as CaptureModel['document'],
          [flatField],
          predicate,
          postFilter
        );
        if (filteredModel) {
          if (!newDocument.properties[rootFieldKey]) {
            newDocument.properties[rootFieldKey] = [];
          }
          // This would be a new entity.
          newDocument.properties[rootFieldKey].push(filteredModel as any);
        }
      } else {
        if (predicate(field as any, document as any)) {
          if (!newDocument.properties[rootFieldKey]) {
            newDocument.properties[rootFieldKey] = [];
          }
          // This is a new field.
          newDocument.properties[rootFieldKey].push(field as any);
        }
        // check if matches condition and add it to new field list.
      }
    }
    if (postFilter && newDocument.properties[rootFieldKey]) {
      if (Array.isArray(postFilter)) {
        for (const filter of postFilter) {
          if (filter) {
            newDocument.properties[rootFieldKey] = filter(newDocument.properties[rootFieldKey] as any[], newDocument);
          }
        }
      } else {
        newDocument.properties[rootFieldKey] = postFilter(newDocument.properties[rootFieldKey] as any[], newDocument);
      }
    }
  }

  // Now we filter.
  const propertyNames = Object.keys(newDocument.properties);
  for (const prop of propertyNames) {
    const possibleEntityList = newDocument.properties[prop];
    if (isEntityList(possibleEntityList)) {
      // Now we need to merge.
      const newProperties: {
        [key: string]: CaptureModel['document'];
      } = {};
      for (const instance of possibleEntityList) {
        if (newProperties[instance.id]) {
          mergeProperties(newProperties[instance.id], instance);
        } else {
          newProperties[instance.id] = instance;
        }
      }
      newDocument.properties[prop] = Object.values(newProperties);
    }
  }

  if (Object.keys(newDocument.properties).length > 0) {
    return newDocument;
  }

  return null;
}
