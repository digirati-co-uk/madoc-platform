import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';
import { BaseSelector } from '../types/selector-types';
import { isEntity } from './is-entity';

export function traverseDocument<TempEntityFields = any>(
  document: CaptureModel['document'] & { temp?: Partial<TempEntityFields> },
  transforms: {
    visitFirstField?: (
      field: BaseField & { temp?: Partial<TempEntityFields> },
      fieldKey: string,
      parent: CaptureModel['document'] & { temp?: Partial<TempEntityFields> },
      path: string[]
    ) => boolean;
    visitField?: (
      field: BaseField & { temp?: Partial<TempEntityFields> },
      fieldKey: string,
      parent: CaptureModel['document'] & { temp?: Partial<TempEntityFields> },
      path: string[]
    ) => void;
    visitSelector?: (
      selector: BaseSelector & { temp?: Partial<TempEntityFields> },
      parent:
        | (CaptureModel['document'] & { temp?: Partial<TempEntityFields> })
        | (BaseField & { temp?: Partial<TempEntityFields> }),
      isRevision: boolean,
      parentSelector: (BaseSelector & { temp?: Partial<TempEntityFields> }) | undefined,
      path: string[]
    ) => void;
    visitProperty?: (
      property: string,
      list:
        | Array<BaseField & { temp?: Partial<TempEntityFields> }>
        | Array<CaptureModel['document'] & { temp?: Partial<TempEntityFields> }>,
      parent: CaptureModel['document'] & { temp?: Partial<TempEntityFields> },
      path: string[]
    ) => void;
    visitEntity?: (
      entity: CaptureModel['document'] & { temp?: Partial<TempEntityFields> },
      entityKey: string | undefined,
      parent: (CaptureModel['document'] & { temp?: Partial<TempEntityFields> }) | undefined,
      path: string[]
    ) => void;
    visitFirstEntity?: (
      entity: CaptureModel['document'] & { temp?: Partial<TempEntityFields> },
      fieldKey: string,
      parent: CaptureModel['document'] & { temp?: Partial<TempEntityFields> },
      path: string[]
    ) => boolean;
    beforeVisitEntity?: (
      entity: CaptureModel['document'] & { temp?: Partial<TempEntityFields> },
      entityKey: string | undefined,
      parent: (CaptureModel['document'] & { temp?: Partial<TempEntityFields> }) | undefined,
      path: string[]
    ) => void;
  },
  key?: string,
  rootParent?: CaptureModel['document'] & { temp?: Partial<TempEntityFields> },
  propertyPath: string[] = []
) {
  if (transforms.beforeVisitEntity) {
    transforms.beforeVisitEntity(document, key, rootParent, propertyPath);
  }
  for (const propKey of Object.keys(document.properties || {})) {
    const prop = document.properties[propKey];
    const newPath = [...propertyPath, 'properties', propKey];
    if (transforms.visitProperty) {
      transforms.visitProperty(propKey, prop, document, newPath);
    }
    let first = true;
    for (const [fieldIndex, field] of Object.entries(prop)) {
      const fieldPath = [...newPath, fieldIndex];
      if (isEntity(field)) {
        if (first && transforms.visitFirstEntity) {
          first = false;
          if (transforms.visitFirstEntity(field, propKey, document, fieldPath)) {
            traverseDocument(field, transforms, propKey, document, fieldPath);
          }
          break;
        }
        traverseDocument(field, transforms, propKey, document, fieldPath);
      } else {
        if (first && transforms.visitFirstField) {
          first = false;
          if (transforms.visitFirstField(field, propKey, document, fieldPath)) {
            if (field.selector && transforms.visitSelector) {
              transforms.visitSelector(field.selector, field, false, undefined, [...fieldPath, 'selector']);
              if (field.selector.revisedBy) {
                for (const [selectorIndex, revisedSelector] of Object.entries(field.selector.revisedBy)) {
                  transforms.visitSelector(revisedSelector as any, field, true, field.selector, [
                    ...fieldPath,
                    'selector',
                    'revisedBy',
                    selectorIndex,
                  ]);
                }
              }
            }
            break;
          }
        }
        if (transforms.visitField) {
          transforms.visitField(field, propKey, document, fieldPath);
        }
      }
      if (field.selector && transforms.visitSelector) {
        transforms.visitSelector(field.selector, field, false, undefined, [...newPath, 'selector']);
        if (field.selector.revisedBy) {
          for (const [selectorIndex, revisedSelector] of Object.entries(field.selector.revisedBy)) {
            transforms.visitSelector(revisedSelector as any, field, true, field.selector, [
              ...newPath,
              'selector',
              'revisedBy',
              selectorIndex,
            ]);
          }
        }
      }
      if ((field as any).temp) {
        delete (field as any).temp;
      }
    }
  }
  if (document.selector && transforms.visitSelector) {
    transforms.visitSelector(document.selector, document, false, undefined, [...propertyPath, 'selector']);
    if (document.selector.revisedBy) {
      for (const [selectorIndex, revisedSelector] of Object.entries(document.selector.revisedBy)) {
        transforms.visitSelector(revisedSelector, document, true, document.selector, [
          ...propertyPath,
          'selector',
          'revisedBy',
          selectorIndex,
        ]);
      }
    }
  }
  if (transforms.visitEntity) {
    transforms.visitEntity(document, key, rootParent, propertyPath);
  }
  if (document.temp) {
    delete document.temp;
  }
}
