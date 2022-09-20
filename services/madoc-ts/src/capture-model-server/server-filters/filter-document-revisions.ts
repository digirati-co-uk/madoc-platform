import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { deleteFrom } from './delete-from';

export function filterDocumentRevisions(
  document: CaptureModel['document'],
  excludeRevisions: string[],
  onlyRevisionFields?: boolean
): CaptureModel['document'] {
  traverseDocument(document, {
    beforeVisitEntity(entity, property, parent) {
      if (property && parent) {
        if (onlyRevisionFields && !entity.revision) {
          deleteFrom(entity.id, property, parent);
        }

        if (entity.revision && excludeRevisions.indexOf(entity.revision) !== -1) {
          deleteFrom(entity.id, property, parent);
        }
      }
    },
    visitField(field, property, parent) {
      if (onlyRevisionFields && !field.revision) {
        deleteFrom(field.id, property, parent);
      }

      if (field.revision && property && parent) {
        if (excludeRevisions.indexOf(field.revision) !== -1) {
          deleteFrom(field.id, property, parent);
        }
      }
    },
    visitSelector(selector, parent, isRevision, parentSelector) {
      if (selector.revisionId && isRevision && parentSelector && parentSelector.revisedBy) {
        parentSelector.revisedBy = parentSelector.revisedBy.filter(s => {
          if (!s.revisionId) {
            return s;
          }
          return excludeRevisions.indexOf(s.revisionId) === -1;
        });
      }
    },
  });

  return document;
}
