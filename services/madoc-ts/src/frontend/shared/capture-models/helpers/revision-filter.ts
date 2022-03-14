import { CaptureModel } from '../types/capture-model';
import { RevisionRequest } from '../types/revision-request';
import { expandModelFields } from './expand-model-fields';
import { filterCaptureModel } from './filter-capture-model';

export function revisionFilter(captureModel: CaptureModel, revision: string): RevisionRequest | null {
  const revisionDescription = captureModel.revisions ? captureModel.revisions.find(item => item.id === revision) : null;
  if (!revisionDescription) {
    return null;
  }

  const model = filterCaptureModel(
    revisionDescription.id,
    captureModel.document,
    expandModelFields(revisionDescription.fields),
    field => {
      return field.revision ? field.revision === revision : false;
    }
  );

  if (!model) {
    return null;
  }

  return {
    captureModelId: captureModel.id,
    source: 'structure',
    document: model,
    revision: revisionDescription,
  };
}
