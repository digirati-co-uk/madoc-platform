import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { deleteFrom } from './delete-from';

export function filterMissingRevisions(captureModel: CaptureModel) {
  const allRevisions = (captureModel.revisions || []).map(r => r.id);

  traverseDocument(captureModel.document, {
    beforeVisitEntity(entity, property, parent) {
      if (property && parent && entity.revision && allRevisions.indexOf(entity.revision) === -1) {
        deleteFrom(entity.id, property, parent);
      }
    },
    visitField(field, property, parent) {
      if (property && parent && field.revision && allRevisions.indexOf(field.revision) === -1) {
        deleteFrom(field.id, property, parent);
      }
    },
    visitSelector(selector, parent, isRevision, parentSelector) {
      if (selector.revisionId && isRevision && parentSelector && parentSelector.revisedBy) {
        parentSelector.revisedBy = parentSelector.revisedBy.filter(s => {
          if (!s.revisionId) {
            return s;
          }
          return allRevisions.indexOf(s.revisionId) !== -1;
        });
      }
    },
  });

  return captureModel;
}
