import { isEntityList } from '../helpers/is-entity';
import { traverseDocument } from '../helpers/traverse-document';
import { CaptureModel } from '../types/capture-model';
import { isEmptyFieldList } from './is-field-list-empty';

export function isEntityEmpty(found: CaptureModel['document']) {
  let isEmpty = true;
  traverseDocument(found, {
    visitProperty(prop, list) {
      if (isEntityList(list)) {
        isEmpty = false;
        for (const entity of list) {
          if (!isEntityEmpty(entity)) {
            isEmpty = false;
            return;
          }
        }
        return;
      }

      if (!isEmptyFieldList(list)) {
        isEmpty = false;
      }
    },
  });

  return isEmpty;
}
