import { useMemo } from 'react';
import { Revisions } from '../../editor/stores/revisions/index';
import { traverseDocument } from '../../helpers/traverse-document';
import { CaptureModel } from '../../types/capture-model';

export function useEntityDetails(document?: CaptureModel['document']) {
  const { currentRevisionId, deletedFields } = Revisions.useStoreState(s => ({
    currentRevisionId: s.currentRevisionId,
    deletedFields: s.currentRevision?.revision.deletedFields,
  }));

  return useMemo(() => {
    if (!document || !currentRevisionId) {
      return { isModified: false, isDeleted: false };
    }

    const isDeleted = deletedFields && deletedFields.indexOf(document?.id);
    let isModified = false;

    // Nice short cuts.
    if (document.selector && document.selector.revisionId === currentRevisionId) {
      return { isModified: true, isDeleted: false };
    }

    if (document.selector && document.selector.revisedBy) {
      for (const selector of document.selector.revisedBy) {
        if (selector.revisionId === currentRevisionId) {
          return { isModified: true, isDeleted: false };
        }
      }
    }

    traverseDocument(document, {
      visitField(field) {
        if (field.revision === currentRevisionId) {
          isModified = true;
        }
      },
      visitSelector(selector) {
        if (selector.revisionId === currentRevisionId) {
          isModified = true;
        }
        if (selector.revisedBy) {
          for (const revisedSelector of selector.revisedBy) {
            if (revisedSelector.revisionId === currentRevisionId) {
              isModified = true;
            }
          }
        }
      },
    });

    return { isModified, isDeleted };
  }, [currentRevisionId, deletedFields, document]);
}
