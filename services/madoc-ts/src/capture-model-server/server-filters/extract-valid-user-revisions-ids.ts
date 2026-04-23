import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { TABULAR_CELL_FLAGS_PROPERTY } from '../../frontend/shared/utility/tabular-cell-flags';

export function extractValidUserRevisionsIds(model: CaptureModel, userId: number) {
  const userUrn = `urn:madoc:user:${userId}`;
  const isTabularModel = !!(
    model.document &&
    model.document.properties &&
    Object.prototype.hasOwnProperty.call(model.document.properties, TABULAR_CELL_FLAGS_PROPERTY)
  );
  const returnMap = {
    myRevisions: [] as string[],
    approvedRevisions: [] as string[],
    excludedRevisions: [] as string[],
  };

  if (!model.revisions) {
    return returnMap;
  }

  for (const revision of model.revisions) {
    let visible = false;
    if (revision.approved) {
      visible = true;
      returnMap.approvedRevisions.push(revision.id);
    }
    if (isTabularModel && revision.status === 'submitted') {
      visible = true;
    }
    if (revision.authors && revision.authors.indexOf(userUrn) !== -1) {
      visible = true;
      returnMap.myRevisions.push(revision.id);
    }

    if (!visible) {
      returnMap.excludedRevisions.push(revision.id);
    }
  }

  return returnMap;
}
