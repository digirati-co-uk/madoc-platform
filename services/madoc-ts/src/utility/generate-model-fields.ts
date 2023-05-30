import { traverseDocument } from '../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel, ModelFields } from '../frontend/shared/capture-models/types/capture-model';

export function generateModelFields(doc: CaptureModel['document']): ModelFields {
  const fullTree = { value: null } as any;
  traverseDocument<{ value: any[] }>(doc, {
    beforeVisitEntity: (entity, key, parent) => {
      entity.temp = entity.temp ? entity.temp : { value: [] };
      if (parent && parent.temp && parent.temp.value) {
        parent.temp.value.push([key, entity.temp.value]);
      }
    },
    visitField: (field, key, parent) => {
      field.temp = { value: key as any };
      if (parent && parent.temp && parent.temp.value) {
        parent.temp.value.push(key);
      }
    },

    visitEntity: (entity, key, parent) => {
      if (!parent && entity.temp && entity.temp.value) {
        // The root has complete.
        fullTree.value = entity.temp.value;
      }
    },
  });

  if (fullTree.value) {
    return fullTree.value;
  }

  return [];
}
