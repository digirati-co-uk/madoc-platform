import { createRevisionRequest } from '../helpers/create-revision-request';
import { expandModelFields } from '../helpers/expand-model-fields';
import { filterEmptyFields, filterRemovedFields } from '../helpers/field-post-filters';
import { filterCaptureModel } from '../helpers/filter-capture-model';
import { findStructure } from '../helpers/find-structure';
import { recurseRevisionDependencies } from '../helpers/recurse-revision-dependencies';
import { traverseDocument } from '../helpers/traverse-document';
import { CaptureModel } from '../types/capture-model';
import { RevisionRequest } from '../types/revision-request';
import { applyModelRootToDocument } from './apply-model-root-to-document';

export function processImportedRevision(
  revision: RevisionRequest['revision'],
  captureModel: CaptureModel,
  { filterEmpty }: { filterEmpty?: boolean } = {}
): RevisionRequest | null {
  const flatFields = expandModelFields(revision.fields);
  const allRevisions = recurseRevisionDependencies(revision.id, captureModel.revisions);

  const document = filterCaptureModel(
    revision.id,
    captureModel.document,
    flatFields,
    field => {
      return field.revision ? allRevisions.indexOf(field.revision) !== -1 : true;
    },
    [
      // Filter removed fields.
      revision.deletedFields ? filterRemovedFields(revision.deletedFields) : undefined,
      // Filter empty fields.
      filterEmpty ? filterEmptyFields : undefined,
    ]
  );

  if (document) {
    // Apply model root.
    const foundStructure = revision.structureId ? findStructure(captureModel, revision.structureId) : null;
    if (
      foundStructure &&
      foundStructure.type === 'model' &&
      foundStructure.modelRoot &&
      foundStructure.modelRoot.length
    ) {
      applyModelRootToDocument(document, foundStructure.modelRoot);
    }

    // Make entities immutable.
    traverseDocument(document, {
      visitEntity(entity) {
        if (entity.revision && entity.revision !== revision.id) {
          entity.immutable = true;
        }
      },
    });

    return createRevisionRequest(captureModel, revision, document);
  }

  return null;
}
