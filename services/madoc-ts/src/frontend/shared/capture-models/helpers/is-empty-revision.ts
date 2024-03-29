import { RevisionRequest } from '../types/revision-request';
import { traverseDocument } from './traverse-document';

export function isEmptyRevision(revision: RevisionRequest) {
  let isEmpty = true;
  traverseDocument(revision.document, {
    visitField(field) {
      if (isEmpty && field.value) {
        isEmpty = false;
      }
    },
  });
  return isEmpty;
}
