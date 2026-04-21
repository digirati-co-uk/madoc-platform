import deepmerge from 'deepmerge';
import { createRevisionRequest } from '../helpers/create-revision-request';
import { expandModelFields } from '../helpers/expand-model-fields';
import { filterEmptyFields, filterRemovedFields } from '../helpers/field-post-filters';
import { filterCaptureModel } from '../helpers/filter-capture-model';
import { findStructure } from '../helpers/find-structure';
import { isEntity } from '../helpers/is-entity';
import { recurseRevisionDependencies } from '../helpers/recurse-revision-dependencies';
import { traverseDocument } from '../helpers/traverse-document';
import { CaptureModel } from '../types/capture-model';
import { RevisionRequest } from '../types/revision-request';
import { applyModelRootToDocument } from './apply-model-root-to-document';

export function processImportedRevision(
  revision: RevisionRequest['revision'],
  captureModel: CaptureModel,
  { filterEmpty, preferRevisionValues }: { filterEmpty?: boolean; preferRevisionValues?: boolean } = {}
): RevisionRequest | null {
  const flatFields = expandModelFields(revision.fields);
  const allRevisions = recurseRevisionDependencies(revision.id, captureModel.revisions);

  const document = filterCaptureModel(
    revision.id,
    deepmerge({}, captureModel.document),
    flatFields,
    (field, parent, key) => {
      if (field.revision) {
        return allRevisions.indexOf(field.revision) !== -1;
      }

      // This will show additional fields - but also empty entities.
      return true;
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

    if (preferRevisionValues) {
      traverseDocument(document, {
        visitProperty(property, list, parent) {
          if (!Array.isArray(list) || list.length < 2) {
            return;
          }

          if ((list as any[]).some(isEntity)) {
            return;
          }

          const ranked = (list as any[])
            .map((item, index) => {
              const itemRevision = item?.revision;

              return {
                item,
                index,
                score: itemRevision === revision.id ? 3 : itemRevision ? 2 : 1,
              };
            })
            .sort((left, right) => {
              if (left.score !== right.score) {
                return right.score - left.score;
              }
              return left.index - right.index;
            });

          parent.properties[property] = ranked.map(entry => entry.item) as any;
        },
      });
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
