import copy from 'fast-copy';
import { isEntity } from '../capture-models/helpers/is-entity';
import { CaptureModel } from '../capture-models/types/capture-model';
import { RevisionRequest } from '../capture-models/types/revision-request';
import { TABULAR_CELL_FLAGS_PROPERTY } from './tabular-cell-flags';

function isTabularDocument(document: CaptureModel['document']) {
  return Object.prototype.hasOwnProperty.call(document.properties, TABULAR_CELL_FLAGS_PROPERTY);
}

export function sanitizeTabularRevisionRequestForSave(revisionRequest: RevisionRequest): RevisionRequest {
  if (!isTabularDocument(revisionRequest.document)) {
    return revisionRequest;
  }

  const rows = revisionRequest.document.properties.rows;
  if (!Array.isArray(rows)) {
    return revisionRequest;
  }

  if (rows.some(row => !isEntity(row))) {
    return revisionRequest;
  }

  const rowEntities = rows as CaptureModel['document'][];
  if (!rowEntities.length) {
    return revisionRequest;
  }
  // Keep sparse/empty rows so row indexes remain stable across submissions.
  // Pruning rows here causes index drift (e.g. row 10 becoming row 1), which
  // breaks review context and multi-contributor stitching.
  return copy(revisionRequest);
}
