import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCaptureModelEditorApi } from '@/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { Revisions } from '@/frontend/shared/capture-models/editor/stores/revisions';
import { TabularSplitView } from '@/frontend/shared/components/TabularSplitView';
import { useReviewRendererContext } from '@/frontend/site/pages/tasks/review-renderers/review-renderer-context';
import type { CustomReviewRendererProps } from '@/frontend/site/pages/tasks/review-renderers/types';
import { useTabularEditorLayout } from './use-tabular-editor-layout';
import { TabularProjectCustomEditorCanvas } from './tabular-project-custom-editor-canvas';
import { TabularProjectCustomEditorTable } from './tabular-project-custom-editor-table';
import {
  netConfigFromSharedStructure,
  type TabularModelColumn,
  type TabularTemplateConfig,
} from './tabular-project-custom-editor-utils';
import { useTabularCellFlags } from './use-tabular-cell-flags';
import { useTabularProjectCustomEditorState } from './use-tabular-project-custom-editor-state';
import { ChevronDown } from '@/frontend/shared/icons/ChevronIcon';

function toNumericId(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toEditableTextValue(value: unknown): string {
  return typeof value === 'string' ? value : value === null || typeof value === 'undefined' ? '' : String(value);
}

function getCellLookupKey(rowIndex: number, columnKey: string): string {
  return `${rowIndex}:${columnKey}`;
}

type ReviewFlaggedCellItem = {
  key: string;
  rowIndex: number;
  columnLabel: string;
  comment?: string;
};

type ReviewLinkedCell = {
  fieldType?: string;
  value: unknown;
};

type FlaggedCellCardProps = {
  flag: ReviewFlaggedCellItem;
  linkedCell?: ReviewLinkedCell;
  canFocusCell: boolean;
  onFocusCell: () => void;
};

function FlaggedCellCard({ flag, linkedCell, canFocusCell, onFocusCell }: FlaggedCellCardProps) {
  const linkedValue =
    linkedCell?.fieldType === 'checkbox-field'
      ? linkedCell.value
        ? 'Yes'
        : 'No'
      : toEditableTextValue(linkedCell?.value);
  const hasLinkedValue = linkedValue.trim().length > 0;

  return (
    <div className="rounded border border-gray-300 bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
        onClick={onFocusCell}
      >
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-red-700">Row {flag.rowIndex + 1}</div>
          <div className="truncate text-sm font-semibold text-slate-900">{flag.columnLabel}</div>
        </div>
        <span className="rounded border border-red-200 bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
          Flagged
        </span>
      </button>

      <div className="space-y-2 border-t border-gray-200 px-2 py-2 text-xs text-slate-700">
        {linkedCell ? (
          <div
            className={`rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm ${
              hasLinkedValue ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            {hasLinkedValue ? linkedValue : 'Empty'}
          </div>
        ) : (
          <div className="text-slate-500">This cell is not available in the table view.</div>
        )}
        {flag.comment ? (
          <div className="rounded border border-red-200 bg-red-50 px-2 py-1 text-red-800">{flag.comment}</div>
        ) : null}
        {!canFocusCell ? (
          <div className="text-slate-500">This column is currently hidden in the table view.</div>
        ) : null}
      </div>
    </div>
  );
}

export function TabularProjectReviewRenderer(props: CustomReviewRendererProps) {
  const review = useReviewRendererContext();
  const table = useCaptureModelEditorApi({ tableProperty: 'rows' });
  const createNewFieldInstance = Revisions.useStoreActions(actions => actions.createNewFieldInstance);
  const removeInstance = Revisions.useStoreActions(actions => actions.removeInstance);
  const templateConfig = (review.project?.template_config || undefined) as TabularTemplateConfig | undefined;
  const netConfig = useMemo(
    () => netConfigFromSharedStructure(templateConfig?.tabular?.structure),
    [templateConfig?.tabular?.structure]
  );
  const tabularColumns = (templateConfig?.tabular?.model?.columns || []) as TabularModelColumn[];
  const taskSubject = (
    review.task.metadata as {
      subject?: { type?: string; id?: number | string; parent?: { type?: string; id?: number | string } };
    }
  )?.subject;
  const fallbackCanvasId =
    taskSubject?.type === 'canvas'
      ? toNumericId(taskSubject.id)
      : taskSubject?.parent?.type === 'canvas'
        ? toNumericId(taskSubject.parent.id)
        : undefined;
  const canvasId = fallbackCanvasId;
  const isCorrectionMode = props.mode === 'write';
  const isEditingDisabled = props.mode !== 'write';

  const {
    splitContainerRef,
    canvasSplitPct,
    startCanvasTableResize,
    isCanvasTableDividerActive,
    setIsCanvasTableDividerHover,
    splitDividerHeight,
  } = useTabularEditorLayout({
    defaultCanvasSplitPct: 68,
    minCanvasHeight: 280,
    minTableHeight: 200,
  });

  const {
    tableActiveCell,
    setTableActiveCell,
    overlayActiveCell,
    visibleColumnKeys,
    headerColumns,
    tableRows,
    showEmptyTableState,
    useLegacyTopLevelLayout,
    visibleTableErrors,
    canAddRow,
    canRemoveRow,
    addRowFromFooter,
    removeRowFromFooter,
  } = useTabularProjectCustomEditorState({
    table,
    tabularColumns,
    netConfig,
    createNewFieldInstance,
    removeInstance,
  });

  const { activeCellColumnLabel, activeCellIsFlagged, activeCellComment, flaggedCells, isCellFlagged } =
    useTabularCellFlags({
      table,
      projectId: review.project?.id,
      canvasId,
      visibleColumnKeys,
      headerColumns,
      tableActiveCell,
      setTableActiveCell,
      useLegacyTopLevelLayout,
      removeRowFromFooter,
    });

  const headerColumnsByKey = useMemo(() => {
    const labels = new Map<string, string>();
    for (const column of headerColumns) {
      labels.set(column.key, column.label);
    }
    return labels;
  }, [headerColumns]);

  const selectedRow = useMemo(() => {
    if (!tableRows.length) {
      return undefined;
    }

    if (tableActiveCell) {
      return tableRows.find(row => row.rowIndex === tableActiveCell.row) || tableRows[0];
    }

    return tableRows[0];
  }, [tableActiveCell, tableRows]);

  useEffect(() => {
    if (tableActiveCell || !selectedRow || !selectedRow.cells.length) {
      return;
    }

    setTableActiveCell({
      row: selectedRow.rowIndex,
      col: selectedRow.cells[0].colIndex,
    });
  }, [selectedRow, setTableActiveCell, tableActiveCell]);

  const selectedCell = useMemo(() => {
    if (!selectedRow?.cells.length) {
      return undefined;
    }

    if (!tableActiveCell) {
      return selectedRow.cells[0];
    }

    return (
      selectedRow.cells.find(cell => cell.rowIndex === tableActiveCell.row && cell.colIndex === tableActiveCell.col) ||
      selectedRow.cells[0]
    );
  }, [selectedRow, tableActiveCell]);

  const selectedRowIndex = selectedRow?.rowIndex ?? null;
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(selectedRowIndex);
  const [isFlaggedCellsExpanded, setIsFlaggedCellsExpanded] = useState(true);
  const previousSelectedRowIndexRef = useRef<number | null>(selectedRowIndex);

  useEffect(() => {
    const previousRowIndex = previousSelectedRowIndexRef.current;
    previousSelectedRowIndexRef.current = selectedRowIndex;

    if (selectedRowIndex === null) {
      return;
    }

    if (previousRowIndex === selectedRowIndex) {
      return;
    }

    setExpandedRowIndex(selectedRowIndex);
  }, [selectedRowIndex]);

  const getColumnLabel = (columnKey: string) => headerColumnsByKey.get(columnKey) || columnKey;
  const flaggedCellsByKey = useMemo(() => {
    const next = new Map<string, (typeof flaggedCells)[number]>();
    for (const flag of flaggedCells) {
      next.set(getCellLookupKey(flag.rowIndex, flag.columnKey), flag);
    }
    return next;
  }, [flaggedCells]);

  const tableRowsByRowIndex = useMemo(() => {
    const next = new Map<number, (typeof tableRows)[number]>();
    for (const row of tableRows) {
      next.set(row.rowIndex, row);
    }
    return next;
  }, [tableRows]);

  const visibleColumnIndexByKey = useMemo(() => {
    const next = new Map<string, number>();
    for (const [index, columnKey] of visibleColumnKeys.entries()) {
      next.set(columnKey, index);
    }
    return next;
  }, [visibleColumnKeys]);

  const flaggedCellsForPanel = useMemo(
    () =>
      flaggedCells.map(flag => {
        const row = tableRowsByRowIndex.get(flag.rowIndex);
        const linkedCell = row?.cells.find(cell => cell.columnKey === flag.columnKey);
        const colIndex = visibleColumnIndexByKey.get(flag.columnKey) ?? -1;

        return {
          flag,
          linkedCell,
          colIndex,
          canFocusCell: colIndex >= 0,
        };
      }),
    [flaggedCells, tableRowsByRowIndex, visibleColumnIndexByKey]
  );

  useEffect(() => {
    if (!selectedCell) {
      return;
    }

    const selectedKey = getCellLookupKey(selectedCell.rowIndex, selectedCell.columnKey);
    if (!flaggedCellsByKey.has(selectedKey)) {
      return;
    }

    setIsFlaggedCellsExpanded(true);
  }, [flaggedCellsByKey, selectedCell]);

  const focusFlaggedCell = useCallback(
    (rowIndex: number, colIndex: number, canFocusCell: boolean) => {
      if (canFocusCell) {
        setTableActiveCell({ row: rowIndex, col: colIndex });
      }
      setExpandedRowIndex(rowIndex);
    },
    [setTableActiveCell]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {props.controls || <props.DefaultControls />}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden border-t border-gray-300 bg-white">
        <aside className="w-[320px] shrink-0 overflow-y-auto border-r border-gray-300 bg-gray-50">
          <div className="border-b border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900">Document</div>
          <div className="flex flex-col gap-4 p-4 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Selected cell</div>
              <div className="mt-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-gray-900">
                {selectedCell ? (
                  <div className="flex flex-col gap-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Row {selectedCell.rowIndex + 1}
                    </div>
                    <div className="text-sm font-semibold">
                      {activeCellColumnLabel || getColumnLabel(selectedCell.columnKey)}
                    </div>
                    <div className="text-xs text-slate-500">Click any table cell or row section to change focus.</div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-600">Select a table cell to inspect this document.</span>
                )}
              </div>
            </div>

            {activeCellIsFlagged ? (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                This cell was flagged
              </div>
            ) : null}

            {activeCellComment ? (
              <div className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800">
                {activeCellComment}
              </div>
            ) : null}

            <div>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-left"
                onClick={() => setIsFlaggedCellsExpanded(previous => !previous)}
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Flagged cells ({flaggedCells.length})
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`fill-current h-4 w-4 text-slate-500 transition-transform duration-200 ${
                    isFlaggedCellsExpanded ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>

              {isFlaggedCellsExpanded ? (
                <div className="mt-2">
                  {flaggedCellsForPanel.length ? (
                    <div className="space-y-2 rounded border border-red-300 bg-red-50 p-2">
                      {flaggedCellsForPanel.map(({ flag, linkedCell, colIndex, canFocusCell }) => (
                        <FlaggedCellCard
                          key={flag.key}
                          flag={flag}
                          linkedCell={linkedCell}
                          canFocusCell={canFocusCell}
                          onFocusCell={() => focusFlaggedCell(flag.rowIndex, colIndex, canFocusCell)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
                      No flagged cells in this document.
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Rows</div>
              {!tableRows.length ? (
                <div className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
                  No table data available.
                </div>
              ) : (
                <div className="flex max-h-[45vh] flex-col gap-2 overflow-y-auto pr-1">
                  {tableRows.map(row => {
                    const isExpanded = expandedRowIndex === row.rowIndex;
                    const isActiveRow = selectedCell?.rowIndex === row.rowIndex;
                    const flaggedCount = row.cells.reduce(
                      (count, cell) => count + (isCellFlagged(cell.rowIndex, cell.columnKey) ? 1 : 0),
                      0
                    );

                    return (
                      <div
                        key={row.key}
                        className={`rounded border ${isActiveRow ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-white'}`}
                      >
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                          onClick={() => {
                            const targetCell = row.cells[0];
                            if (targetCell) {
                              setTableActiveCell({ row: targetCell.rowIndex, col: targetCell.colIndex });
                            }
                            setExpandedRowIndex(previous => (previous === row.rowIndex ? null : row.rowIndex));
                          }}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Row {row.rowIndex + 1}
                            </div>
                            <div className="text-sm font-medium text-slate-900">
                              {isActiveRow ? 'Active row' : `${row.cells.length} fields`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {flaggedCount ? (
                              <span className="rounded border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                                {flaggedCount} flagged
                              </span>
                            ) : null}
                            <span className="text-xs text-slate-500">
                              <ChevronDown
                                aria-hidden="true"
                                className={`fill-current h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                              />
                            </span>
                          </div>
                        </button>

                        {isExpanded ? (
                          <div className="space-y-2 border-t border-gray-200 px-2 py-2">
                            {row.cells.map(cell => {
                              const isSelectedCell = selectedCell?.key === cell.key;
                              const columnLabel = getColumnLabel(cell.columnKey);
                              const cellFlag = flaggedCellsByKey.get(getCellLookupKey(cell.rowIndex, cell.columnKey));
                              const flagged = !!cellFlag || isCellFlagged(cell.rowIndex, cell.columnKey);
                              const isCheckbox = cell.fieldType === 'checkbox-field';
                              const textValue = toEditableTextValue(cell.value);
                              const hasTextValue = textValue.trim().length > 0;

                              return (
                                <div
                                  key={cell.key}
                                  className={`rounded border px-2 py-2 ${isSelectedCell ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-white'}`}
                                >
                                  <div className="mb-1 flex items-center justify-between gap-2">
                                    <button
                                      type="button"
                                      className="text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                                      onClick={() => setTableActiveCell({ row: cell.rowIndex, col: cell.colIndex })}
                                    >
                                      {columnLabel}
                                    </button>
                                    {flagged ? (
                                      <span className="rounded border border-red-200 bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                                        Flagged
                                      </span>
                                    ) : null}
                                  </div>
                                  {isCheckbox ? (
                                    isCorrectionMode ? (
                                      <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                                        <input
                                          type="checkbox"
                                          checked={!!cell.value}
                                          disabled={isEditingDisabled}
                                          onFocus={() => setTableActiveCell({ row: cell.rowIndex, col: cell.colIndex })}
                                          onClick={() => setTableActiveCell({ row: cell.rowIndex, col: cell.colIndex })}
                                          onChange={event => {
                                            if (isEditingDisabled) {
                                              return;
                                            }
                                            cell.onChange(event.target.checked);
                                          }}
                                        />
                                        <span>{cell.value ? 'Yes' : 'No'}</span>
                                      </label>
                                    ) : (
                                      <button
                                        type="button"
                                        className="inline-flex min-h-[32px] items-center rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm text-gray-800"
                                        onClick={() => setTableActiveCell({ row: cell.rowIndex, col: cell.colIndex })}
                                      >
                                        {cell.value ? 'Yes' : 'No'}
                                      </button>
                                    )
                                  ) : isCorrectionMode ? (
                                    <textarea
                                      rows={2}
                                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      value={textValue}
                                      readOnly={isEditingDisabled}
                                      onFocus={() => setTableActiveCell({ row: cell.rowIndex, col: cell.colIndex })}
                                      onClick={() => setTableActiveCell({ row: cell.rowIndex, col: cell.colIndex })}
                                      onChange={event => {
                                        if (isEditingDisabled) {
                                          return;
                                        }
                                        cell.onChange(event.target.value);
                                      }}
                                    />
                                  ) : (
                                    <button
                                      type="button"
                                      className={`w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-left text-sm ${
                                        hasTextValue ? 'text-gray-900' : 'text-gray-400'
                                      }`}
                                      onClick={() => setTableActiveCell({ row: cell.rowIndex, col: cell.colIndex })}
                                    >
                                      {hasTextValue ? textValue : 'Empty'}
                                    </button>
                                  )}
                                  {cellFlag?.comment ? (
                                    <div className="mt-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-800">
                                      {cellFlag.comment}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TabularSplitView
            containerRef={splitContainerRef}
            className="flex-1"
            topTrack={`minmax(0, ${canvasSplitPct}fr)`}
            bottomTrack={`minmax(0, ${100 - canvasSplitPct}fr)`}
            dividerHeight={splitDividerHeight}
            dividerAriaLabel="Resize canvas and table"
            onResizeStart={startCanvasTableResize}
            onDividerHoverChange={setIsCanvasTableDividerHover}
            isDividerActive={isCanvasTableDividerActive}
            topPanel={
              <div className="h-full min-h-0 min-w-0 overflow-hidden">
                {canvasId ? (
                  <TabularProjectCustomEditorCanvas
                    canvasId={canvasId}
                    netConfig={netConfig}
                    activeCell={overlayActiveCell}
                    zoomTrackingDefaultEnabled={templateConfig?.enableZoomTracking !== false}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-600">
                    No image preview available for this task.
                  </div>
                )}
              </div>
            }
            bottomPanel={
              <div className="min-h-0 min-w-0 overflow-auto p-3">
                {table.status !== 'ready' && !useLegacyTopLevelLayout ? (
                  <div className="rounded border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
                    Table configuration unavailable for this review.
                  </div>
                ) : (
                  <TabularProjectCustomEditorTable
                    headerColumns={headerColumns}
                    rows={tableRows}
                    showEmptyState={showEmptyTableState}
                    tableActiveCell={tableActiveCell}
                    onActiveCellChange={setTableActiveCell}
                    disabled={isEditingDisabled}
                    canAddRow={canAddRow && !isEditingDisabled}
                    canRemoveRow={canRemoveRow && !isEditingDisabled}
                    addRowFromFooter={addRowFromFooter}
                    removeRowFromFooter={removeRowFromFooter}
                    isCellFlagged={isCellFlagged}
                    showRowControls={false}
                  />
                )}
                {visibleTableErrors.length ? (
                  <pre className="mt-3 whitespace-pre-wrap text-sm text-red-700">{visibleTableErrors.join('\n')}</pre>
                ) : null}
              </div>
            }
          />

          {props.saveControl ? (
            <div className="border-t border-gray-300 bg-gray-100 px-3 py-2">{props.saveControl}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
