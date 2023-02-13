import { CaptureModel } from '../types/capture-model';
import { RevisionRequest } from '../types/revision-request';
import { processImportedRevision } from '../utility/process-imported-revision';
import { forkDocument } from './create-revision-document';
import { createRevisionRequestFromStructure } from './create-revision-request';
import { filterRevises } from './filter-revises';
import { flattenStructures } from './flatten-structures';
import { isEntityList } from './is-entity';
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

  fixModelBugs(captureModel);

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
    const processed = processImportedRevision(revision, captureModel, { filterEmpty });
    if (processed) {
      models.push(processed);
    }
  }

  return models;
}

export function fixModelBugs(captureModel: CaptureModel) {
  // First. Fix bug.
  traverseDocument(captureModel.document, {
    visitProperty(property, list: any[], parent) {
      // The bug: When an entity has no revision ID but it's only properties are
      // all revision.
      // Criteria:
      // - Entity has allowMultiple=true
      // - There is an entity without a revision - but field values
      // - This is no entity without a revision (different bug)
      if (isEntityList(list)) {
        const first = list.find(r => !r.revision);
        if (first && first.allowMultiple) {
          // We need to check if there are any revision in here.
          let hasRevision: string | undefined = undefined;
          traverseDocument(first, {
            visitField(f) {
              if (f.revision) {
                hasRevision = f.revision;
              }
            },
          });
          if (hasRevision) {
            const toAdd = forkDocument(first, {
              revisionId: undefined,
              editValues: false,
              removeValues: true,
              addRevises: false,
              generateNewIds: true,
            });
            toAdd.immutable = true;
            // Set revision, and also collapse selectors to fix the model.
            first.revision = hasRevision;
            first.immutable = false;
            traverseDocument(first, {
              visitProperty(vproperty, vlist, vparent) {
                vparent.properties[vproperty] = filterRevises(vlist as any, true) as any;
              },
              visitSelector(selector, selectorParent) {
                if (selector.revisionId !== hasRevision && selector.revisedBy) {
                  const found = selector.revisedBy.find(r => r.revisionId === hasRevision);
                  if (found) {
                    selectorParent.selector = found;
                  }
                }
              },
            });

            parent.properties[property] = [toAdd, ...list];
          }
        }
      }
    },
  });
}
