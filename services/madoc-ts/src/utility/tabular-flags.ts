import type { BaseField } from '../frontend/shared/capture-models/types/field-types';
import type { RevisionRequest } from '../frontend/shared/capture-models/types/revision-request';
import {
  isTabularCellFlagged,
  parseTabularCellFlags,
  TABULAR_CELL_FLAGS_PROPERTY,
} from '../frontend/shared/utility/tabular-cell-flags';

function isBaseField(value: unknown): value is BaseField {
  return !!value && typeof value === 'object' && !Array.isArray(value) && 'value' in value;
}

function getFirstField(values: unknown[]): BaseField | null {
  const maybeField = values.find(isBaseField);
  return maybeField || null;
}

export function getTabularFlaggedCellCount(revisionRequest: RevisionRequest): number {
  const rawFlags = revisionRequest.document?.properties?.[TABULAR_CELL_FLAGS_PROPERTY];
  if (!Array.isArray(rawFlags)) {
    return 0;
  }

  const flagsField = getFirstField(rawFlags);
  if (!flagsField) {
    return 0;
  }

  return Object.values(parseTabularCellFlags(flagsField.value)).filter(flag => isTabularCellFlagged(flag)).length;
}

export function hasTabularFlaggedCells(revisionRequest: RevisionRequest): boolean {
  return getTabularFlaggedCellCount(revisionRequest) > 0;
}
