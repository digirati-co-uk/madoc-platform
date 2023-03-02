import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';

export function extractRevisionWithStatuses(model: CaptureModel, statuses: string[]): string[] {
  const toReturn = [];
  if (!model.revisions) {
    return [];
  }

  for (const revision of model.revisions) {
    if (revision.status) {
      if (statuses.indexOf(revision.status) !== -1) {
        toReturn.push(revision.id);
      }
    }
  }

  return toReturn;
}
