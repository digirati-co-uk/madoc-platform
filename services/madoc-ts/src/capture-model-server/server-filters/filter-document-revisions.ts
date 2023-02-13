import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { deleteFrom } from './delete-from';

export function filterDocumentRevisions(
  document: CaptureModel['document'],
  excludeRevisions: string[],
  onlyRevisionFields?: boolean
): CaptureModel['document'] {
  traverseDocument(document, {
    visitEntity(entity, property, parent) {
      if (property && parent) {
        const hasRevisions = entity?.temp && entity.temp.revisions && entity.temp.revisions.length;
        if (onlyRevisionFields && !entity.revision && !hasRevisions) {
          console.log('deleted', entity.id);
          deleteFrom(entity.id, property, parent);
        }

        if (entity.revision && excludeRevisions.indexOf(entity.revision) !== -1) {
          parent.temp = parent.temp || {};
          parent.temp.revisions = parent.temp.revisions || [];
          parent.temp.revisions.push(entity.revision);

          deleteFrom(entity.id, property, parent);
        }
      }
    },
    visitField(field, property, parent) {
      const selectorRevisions = field.selector?.revisedBy?.filter(
        r => r.revisionId && excludeRevisions.indexOf(r.revisionId) !== -1
      );
      if (onlyRevisionFields && !field.revision) {
        deleteFrom(field.id, property, parent);
      }

      if (field.revision && property && parent) {
        parent.temp = parent.temp || {};
        parent.temp.revisions = parent.temp.revisions || [];
        parent.temp.revisions.push(field.revision);
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
