import { CaptureModel } from '../types/capture-model';
import { RevisionRequest } from '../types/revision-request';
import { expandModelFields } from './expand-model-fields';
import { createRevisionRequest, createRevisionRequestFromStructure } from './create-revision-request';
import { filterCaptureModel } from './filter-capture-model';
import { flattenStructures } from './flatten-structures';
import { recurseRevisionDependencies } from './recurse-revision-dependencies';
import { filterEmptyFields, filterRemovedFields } from './field-post-filters';
import { traverseDocument } from './traverse-document';

export function captureModelToRevisionList(
  captureModel: CaptureModel,
  includeStructures = false,
  filterEmpty = true
): RevisionRequest[] {
  const models: RevisionRequest[] = [];

  if (!captureModel.id) {
    throw new Error('Cannot make revision on model that has not yet been saved.');
  }

  if (includeStructures) {
    const flatStructures = flattenStructures(captureModel.structure);
    for (const structure of flatStructures) {
      try {
        models.push(createRevisionRequestFromStructure(captureModel, structure, true));
      } catch (err) {
        console.error(err);
      }
    }
  }

  for (const revision of captureModel.revisions || []) {
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
      // Make entities immutable.
      traverseDocument(document, {
        visitEntity(entity) {
          if (entity.revision && entity.revision !== revision.id) {
            entity.immutable = true;
          }
        },
      });

      models.push(createRevisionRequest(captureModel, revision, document));
    }
  }

  return models;
}
