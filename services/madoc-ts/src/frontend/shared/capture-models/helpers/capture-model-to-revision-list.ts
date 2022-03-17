import { CaptureModel } from '../types/capture-model';
import { RevisionRequest } from '../types/revision-request';
import { processImportedRevision } from '../utility/process-imported-revision';
import { createRevisionRequestFromStructure } from './create-revision-request';
import { flattenStructures } from './flatten-structures';

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
    const processed = processImportedRevision(revision, captureModel, { filterEmpty });
    if (processed) {
      models.push(processed);
    }
  }

  return models;
}
