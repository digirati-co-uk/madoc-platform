import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isEntity } from '@/frontend/shared/capture-models/helpers/is-entity';
import { useRevisionList } from '@/frontend/shared/capture-models/new/hooks/use-revision-list';
import type { CaptureModel } from '@/frontend/shared/capture-models/types/capture-model';
import type { BaseField } from '@/frontend/shared/capture-models/types/field-types';
import type { RevisionRequest } from '@/frontend/shared/capture-models/types/revision-request';
import { EmptyState } from '@/frontend/shared/layout/EmptyState';
import {
  isTabularCellFlagged,
  parseTabularCellFlags,
  TABULAR_CELL_FLAGS_PROPERTY,
  type TabularCellFlag,
} from '@/frontend/shared/utility/tabular-cell-flags';
import { RevisionList } from '@/frontend/site/features/tasks/RevisionList';
import { isTabularSystemProperty } from './tabular-project-custom-editor-utils';

type TabularPreviewRow = {
  rowIndex: number;
  cells: Array<{ label: string; value: string }>;
  flags: TabularCellFlag[];
  notes: TabularCellFlag[];
};

type TabularCellReviewsByRow = { flags: TabularCellFlag[]; notes: TabularCellFlag[] };

const EMPTY_ROW_VALUES_LINE = 'No row values.';
const EMPTY_ROW_VALUES_MESSAGE = 'No row values yet.';
const FLAGGED_CELLS_LINE = 'Flagged cells:';
const NOTE_PREFIX = 'Note:';

function formatColumnKey(columnKey: string): string {
  const normalized = columnKey.replace(/[_-]+/g, ' ').trim();
  return normalized || columnKey;
}

function sortFlagsByColumnKey(flags: TabularCellFlag[]): TabularCellFlag[] {
  return [...flags].sort((left, right) => left.columnKey.localeCompare(right.columnKey));
}

function createEmptyCellReviewsByRow(): TabularCellReviewsByRow {
  return { flags: [], notes: [] };
}

function normalizePreviewValue(value: unknown): string | null {
  if (value === null || typeof value === 'undefined') {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : null;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : null;
  }

  if (Array.isArray(value)) {
    const combined = value
      .map(item => normalizePreviewValue(item))
      .filter((item): item is string => !!item)
      .join(', ');
    return combined || null;
  }

  return null;
}

function getFirstField(values: Array<CaptureModel['document'] | BaseField>): BaseField | null {
  const maybeField = values.find((item): item is BaseField => !isEntity(item));
  return maybeField || null;
}

function getCellReviewsByRowIndex(document: CaptureModel['document']): Map<number, TabularCellReviewsByRow> {
  const byRowIndex = new Map<number, TabularCellReviewsByRow>();
  const rawFlags = document.properties[TABULAR_CELL_FLAGS_PROPERTY];

  if (!Array.isArray(rawFlags)) {
    return byRowIndex;
  }

  const flagsField = getFirstField(rawFlags as Array<CaptureModel['document'] | BaseField>);
  if (!flagsField) {
    return byRowIndex;
  }

  for (const flag of Object.values(parseTabularCellFlags(flagsField.value))) {
    const existing = byRowIndex.get(flag.rowIndex) || createEmptyCellReviewsByRow();
    if (isTabularCellFlagged(flag)) {
      existing.flags.push(flag);
    } else {
      existing.notes.push(flag);
    }
    byRowIndex.set(flag.rowIndex, existing);
  }

  return byRowIndex;
}

function getEntityRows(document: CaptureModel['document']): TabularPreviewRow[] {
  const rows = document.properties.rows;
  if (!Array.isArray(rows)) {
    return [];
  }

  const entities = rows.filter(isEntity) as CaptureModel['document'][];
  return entities.map((rowEntity, rowIndex) => ({
    rowIndex,
    cells: Object.entries(rowEntity.properties).flatMap(([columnKey, values]) => {
      if (isTabularSystemProperty(columnKey) || !Array.isArray(values)) {
        return [];
      }

      const field = getFirstField(values as Array<CaptureModel['document'] | BaseField>);
      if (!field) {
        return [];
      }

      const value = normalizePreviewValue(field.value);
      if (!value) {
        return [];
      }

      return [{ label: field.label?.trim() || formatColumnKey(columnKey), value }];
    }),
    flags: [],
    notes: [],
  }));
}

function getTopLevelRows(document: CaptureModel['document']): TabularPreviewRow[] {
  const columns = Object.entries(document.properties).filter(([columnKey, values]) => {
    if (isTabularSystemProperty(columnKey) || !Array.isArray(values)) {
      return false;
    }
    return !values.some(isEntity);
  });

  const rowCount = columns.reduce((max, [, values]) => Math.max(max, values.length), 0);
  if (!rowCount) {
    return [];
  }

  return Array.from({ length: rowCount }, (_unused, rowIndex) => ({
    rowIndex,
    cells: columns.flatMap(([columnKey, values]) => {
      const maybeField = values[rowIndex];
      if (!maybeField || isEntity(maybeField)) {
        return [];
      }

      const value = normalizePreviewValue(maybeField.value);
      if (!value) {
        return [];
      }

      return [{ label: maybeField.label?.trim() || formatColumnKey(columnKey), value }];
    }),
    flags: [],
    notes: [],
  }));
}

function withCellReviewRows(
  rows: TabularPreviewRow[],
  reviewsByRow: Map<number, TabularCellReviewsByRow>
): TabularPreviewRow[] {
  const mergedRows = rows.map(row => ({
    ...row,
    flags: sortFlagsByColumnKey(reviewsByRow.get(row.rowIndex)?.flags || []),
    notes: sortFlagsByColumnKey(reviewsByRow.get(row.rowIndex)?.notes || []),
  }));
  const knownRows = new Set(mergedRows.map(row => row.rowIndex));

  for (const [rowIndex, reviews] of reviewsByRow.entries()) {
    if (knownRows.has(rowIndex)) {
      continue;
    }
    mergedRows.push({
      rowIndex,
      cells: [],
      flags: sortFlagsByColumnKey(reviews.flags),
      notes: sortFlagsByColumnKey(reviews.notes),
    });
  }

  return mergedRows.sort((left, right) => left.rowIndex - right.rowIndex);
}

function toPreviewField(documentId: string, revisionId: string, row: TabularPreviewRow): BaseField {
  const notedCells = row.notes.map(note => {
    const noteComment = note.comment?.trim() ? note.comment.trim() : '';
    return {
      label: formatColumnKey(note.columnKey),
      value: noteComment ? `${NOTE_PREFIX} ${noteComment}` : NOTE_PREFIX,
    };
  });
  const previewCells = [...row.cells, ...notedCells];
  const valuesLine = previewCells.length
    ? previewCells.map(cell => `${cell.label}: [${cell.value}]`).join('  ')
    : EMPTY_ROW_VALUES_LINE;
  const flagsLine = row.flags.length
    ? [FLAGGED_CELLS_LINE, ...row.flags.map(flag => `- ${formatColumnKey(flag.columnKey)}`)].join('\n')
    : null;

  return {
    id: `${documentId}-${revisionId}-preview-row-${row.rowIndex + 1}`,
    type: 'text-field',
    label: `Row ${row.rowIndex + 1}`,
    revision: revisionId,
    value: flagsLine ? `${valuesLine}\n\n${flagsLine}` : valuesLine,
  };
}

function createContributionPreviewDocument(
  document: CaptureModel['document'],
  revisionId: string
): CaptureModel['document'] {
  const reviewsByRow = getCellReviewsByRowIndex(document);
  const rows = getEntityRows(document);
  const resolvedRows = rows.length ? rows : getTopLevelRows(document);
  const previewRows = withCellReviewRows(resolvedRows, reviewsByRow).filter(
    row => row.cells.length || row.flags.length || row.notes.length
  );

  if (!previewRows.length) {
    return {
      ...document,
      properties: {
        previewRows: [
          {
            id: `${document.id}-${revisionId}-preview-row-1`,
            type: 'text-field',
            label: 'Row 1',
            revision: revisionId,
            value: EMPTY_ROW_VALUES_MESSAGE,
          },
        ],
      },
    };
  }

  const rowProperties: CaptureModel['document']['properties'] = {};
  for (const row of previewRows) {
    rowProperties[`previewRow${row.rowIndex + 1}`] = [toPreviewField(document.id, revisionId, row)];
  }

  return {
    ...document,
    properties: rowProperties,
  };
}

function sanitizeRevisionsForPanel(revisions: RevisionRequest[]): RevisionRequest[] {
  return revisions.map(revision => ({
    ...revision,
    document: createContributionPreviewDocument(revision.document, revision.revision.id),
  }));
}

function ViewTabularRevisions() {
  const { t } = useTranslation();
  const revisions = useRevisionList({ filterCurrentView: false });
  const drafts = useMemo(() => sanitizeRevisionsForPanel(revisions.myUnpublished), [revisions.myUnpublished]);
  const submitted = useMemo(() => sanitizeRevisionsForPanel(revisions.mySubmitted), [revisions.mySubmitted]);
  const approved = useMemo(
    () => sanitizeRevisionsForPanel(revisions.myAcceptedRevisions),
    [revisions.myAcceptedRevisions]
  );
  const rejected = useMemo(() => sanitizeRevisionsForPanel(revisions.myRejected), [revisions.myRejected]);

  if (!drafts.length && !submitted.length && !approved.length && !rejected.length) {
    return <EmptyState>{t('No submissions yet')}</EmptyState>;
  }

  return (
    <div style={{ padding: '0 .5em' }}>
      <RevisionList title={t('Drafts')} revisions={drafts} editable />
      <RevisionList title={t('In review')} revisions={submitted} />
      <RevisionList title={t('Approved')} revisions={approved} />
      <RevisionList title={t('Rejected')} revisions={rejected} />
    </div>
  );
}

export function TabularProjectContributionsPanel() {
  return <ViewTabularRevisions />;
}
