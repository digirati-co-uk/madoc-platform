import type { CaptureModel } from '../capture-models/types/capture-model';
import type { RevisionRequest } from '../capture-models/types/revision-request';
import { TABULAR_CELL_FLAGS_PROPERTY } from './tabular-cell-flags';

function isTabularDocument(document: CaptureModel['document']) {
  return Object.prototype.hasOwnProperty.call(document.properties, TABULAR_CELL_FLAGS_PROPERTY);
}

export function sanitizeTabularRevisionRequestForSave(revisionRequest: RevisionRequest): RevisionRequest {
  if (!isTabularDocument(revisionRequest.document)) {
    return revisionRequest;
  }

  return revisionRequest;
}
