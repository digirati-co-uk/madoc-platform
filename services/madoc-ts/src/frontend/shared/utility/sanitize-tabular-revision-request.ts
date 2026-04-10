import copy from 'fast-copy';
import { isEntity } from '../capture-models/helpers/is-entity';
import { CaptureModel } from '../capture-models/types/capture-model';
import { BaseField } from '../capture-models/types/field-types';
import { RevisionRequest } from '../capture-models/types/revision-request';
import {
  parseTabularCellFlags,
  serializeTabularCellFlags,
  shiftTabularCellFlagsAfterRowRemoval,
  TABULAR_CELL_FLAGS_PROPERTY,
} from './tabular-cell-flags';

function isEmptyRowValue(value: unknown): boolean {
  if (value === null || typeof value === 'undefined') {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0 || value.every(isEmptyRowValue);
  }

  return false;
}

function isTabularDocument(document: CaptureModel['document']) {
  return Object.prototype.hasOwnProperty.call(document.properties, TABULAR_CELL_FLAGS_PROPERTY);
}

function isEmptyTabularRow(row: CaptureModel['document']) {
  const entries = Object.values(row.properties);
  if (!entries.length) {
    return true;
  }

  return entries.every(instances => {
    const fields = (instances as Array<CaptureModel['document'] | BaseField>).filter(
      (item): item is BaseField => !isEntity(item)
    );
    if (!fields.length) {
      return true;
    }

    return fields.every(field => isEmptyRowValue(field.value));
  });
}

function findTabularFlagsField(document: CaptureModel['document']): BaseField | null {
  const tabularFlagsProperty = document.properties[TABULAR_CELL_FLAGS_PROPERTY];
  if (!Array.isArray(tabularFlagsProperty)) {
    return null;
  }

  const propertyList = tabularFlagsProperty as Array<CaptureModel['document'] | BaseField>;
  const maybeField = propertyList.find((item): item is BaseField => !isEntity(item));
  if (!maybeField || isEntity(maybeField)) {
    return null;
  }

  return maybeField;
}

function updateTabularFlagsAfterRowPrune(document: CaptureModel['document'], removedRowIndexes: number[]) {
  if (!removedRowIndexes.length) {
    return;
  }

  const flagsField = findTabularFlagsField(document);
  if (!flagsField) {
    return;
  }

  const existingFlags = parseTabularCellFlags(flagsField.value);
  if (!Object.keys(existingFlags).length) {
    return;
  }

  const sortedRemovedIndexes = Array.from(new Set(removedRowIndexes)).sort((left, right) => right - left);
  let shiftedFlags = existingFlags;
  for (const removedRowIndex of sortedRemovedIndexes) {
    shiftedFlags = shiftTabularCellFlagsAfterRowRemoval(shiftedFlags, removedRowIndex);
  }
  const existingSerialized = serializeTabularCellFlags(existingFlags);
  const shiftedSerialized = serializeTabularCellFlags(shiftedFlags);

  if (shiftedSerialized === existingSerialized) {
    return;
  }

  flagsField.value = shiftedSerialized;
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

  const retainedRows: CaptureModel['document'][] = [];
  const removedRowIndexes: number[] = [];

  rowEntities.forEach((row, rowIndex) => {
    if (isEmptyTabularRow(row)) {
      removedRowIndexes.push(rowIndex);
      return;
    }

    retainedRows.push(row);
  });

  if (!removedRowIndexes.length) {
    return revisionRequest;
  }

  const sanitizedRequest = copy(revisionRequest);
  sanitizedRequest.document.properties.rows = retainedRows;
  updateTabularFlagsAfterRowPrune(sanitizedRequest.document, removedRowIndexes);
  return sanitizedRequest;
}
