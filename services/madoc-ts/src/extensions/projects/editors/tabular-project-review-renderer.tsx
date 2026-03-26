import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCaptureModelEditorApi } from '@/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { Revisions } from '@/frontend/shared/capture-models/editor/stores/revisions';
import { TabularSplitView } from '@/frontend/shared/components/TabularSplitView';
import { FullScreenEnterIcon } from '@/frontend/shared/icons/FullScreenEnterIcon';
import { FullScreenExitIcon } from '@/frontend/shared/icons/FullScreenExitIcon';
import FlagIcon from '@/frontend/shared/icons/FlagIcon';
import { MaximiseWindow } from '@/frontend/shared/layout/MaximiseWindow';
import { useReviewRendererContext } from '@/frontend/site/pages/tasks/review-renderers/review-renderer-context';
import {
  EMPTY_REVIEW_BLOCKING_ISSUES,
  toReviewBlockingIssueState,
  type CustomReviewRendererProps,
} from '@/frontend/site/pages/tasks/review-renderers/types';
import { useTabularEditorLayout } from './use-tabular-editor-layout';
import { TabularProjectCustomEditorCanvas } from './tabular-project-custom-editor-canvas';
import { TabularProjectCustomEditorTable } from './tabular-project-custom-editor-table';
import {
  netConfigFromSharedStructure,
  type TabularModelColumn,
  type TabularTemplateConfig,
} from './tabular-project-custom-editor-utils';
import {
  detectTabularReviewIssues,
  isFocusableTabularReviewIssue,
  type TabularReviewIssue,
} from './tabular-review-validation';
import { useTabularCellFlags } from './use-tabular-cell-flags';
import { useTabularProjectCustomEditorState } from './use-tabular-project-custom-editor-state';

const MAX_BLOCKING_ISSUE_BADGE = 99;

function getReviewFlaggedPanelStorageKey(taskId: string) {
  return `tabular-review-flagged-panel-open:${taskId}`;
}

function getStoredFlaggedPanelState(taskId?: string) {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!taskId) {
    return false;
  }

  try {
    return window.sessionStorage.getItem(getReviewFlaggedPanelStorageKey(taskId)) === '1';
  } catch {
    return false;
  }
}

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

type ReviewFlaggedCellItem = {
  key: string;
  rowIndex: number;
  columnKey: string;
  columnLabel: string;
  comment?: string;
};

type ReviewLinkedCell = {
  value: unknown;
};

type FlaggedCellCardProps = {
  flag: ReviewFlaggedCellItem;
  linkedCell?: ReviewLinkedCell;
  canUnflagCell: boolean;
  onFocusCell: () => void;
  onUnflagCell: () => void;
};

function FlaggedCellCard({ flag, linkedCell, canUnflagCell, onFocusCell, onUnflagCell }: FlaggedCellCardProps) {
  const linkedValue = toEditableTextValue(linkedCell?.value);
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
          <div className="text-slate-500">This flagged cell is no longer available in the current table view.</div>
        )}

        {flag.comment ? (
          <div className="whitespace-pre-wrap break-all rounded border border-red-200 bg-red-50 px-2 py-1 text-red-800">
            {flag.comment}
          </div>
        ) : null}

        {canUnflagCell ? (
          <div className="pt-1">
            <button
              type="button"
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              onClick={onUnflagCell}
            >
              Unflag cell
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type BlockingIssueCardProps = {
  issue: TabularReviewIssue;
  onFocusIssue: () => void;
};

function BlockingIssueCard({ issue, onFocusIssue }: BlockingIssueCardProps) {
  const canFocusCell = isFocusableTabularReviewIssue(issue);

  if (canFocusCell) {
    return (
      <button
        type="button"
        className="w-full rounded border border-red-200 bg-red-50 px-3 py-2 text-left text-sm text-red-900 transition-colors hover:bg-red-100"
        onClick={onFocusIssue}
      >
        <div className="font-semibold">{issue.message}</div>
        <div className="mt-1 text-xs font-medium uppercase tracking-wide text-red-700">Jump to flagged cell</div>
      </button>
    );
  }

  return (
    <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
      <div className="font-semibold">{issue.message}</div>
    </div>
  );
}

export function TabularProjectReviewRenderer(props: CustomReviewRendererProps) {
  const review = useReviewRendererContext();
  const onBlockingIssuesChange = props.onBlockingIssuesChange;
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
  const reviewTaskId = review.task?.id ? String(review.task.id) : undefined;
  const isEditingDisabled = props.mode !== 'write';
  const [isFlaggedPanelOpen, setIsFlaggedPanelOpen] = useState(() => getStoredFlaggedPanelState(reviewTaskId));

  const {
    splitContainerRef,
    canvasSplitPct,
    startCanvasTableResize,
    isCanvasTableDividerActive,
    setIsCanvasTableDividerHover,
    splitDividerHeight,
  } = useTabularEditorLayout({
    defaultCanvasSplitPct: 40,
    minCanvasHeight: 160,
    minTableHeight: 180,
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

  const { flaggedCells, isCellFlagged, onRemoveFlag } = useTabularCellFlags({
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

  useEffect(() => {
    if (tableActiveCell) {
      return;
    }

    const firstCell = tableRows[0]?.cells[0];
    if (!firstCell) {
      return;
    }

    setTableActiveCell({
      row: firstCell.rowIndex,
      col: firstCell.colIndex,
    });
  }, [setTableActiveCell, tableActiveCell, tableRows]);

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

  const getFlaggedCellPanelData = useCallback(
    (rowIndex: number, columnKey: string) => {
      const row = tableRowsByRowIndex.get(rowIndex);
      const colIndex = visibleColumnIndexByKey.get(columnKey) ?? -1;
      const linkedCellByIndex = row && colIndex >= 0 ? row.cells[colIndex] : undefined;
      const linkedCellByKey = row?.cells.find(cell => cell.columnKey === columnKey);

      return {
        colIndex,
        linkedCell: linkedCellByKey || linkedCellByIndex,
        canFocusCell: !!linkedCellByIndex,
      };
    },
    [tableRowsByRowIndex, visibleColumnIndexByKey]
  );

  const flaggedCellsForPanel = useMemo(
    () =>
      flaggedCells.map(flag => ({
        flag,
        ...getFlaggedCellPanelData(flag.rowIndex, flag.columnKey),
      })),
    [flaggedCells, getFlaggedCellPanelData]
  );

  const blockingIssues = useMemo(
    () =>
      detectTabularReviewIssues({
        visibleTableErrors,
        flaggedCells: flaggedCellsForPanel.map(({ flag, canFocusCell }) => ({
          ...flag,
          canFocusCell,
        })),
      }),
    [flaggedCellsForPanel, visibleTableErrors]
  );
  const blockingIssueCount = blockingIssues.length;
  const flaggedCellCount = flaggedCells.length;
  const blockingIssueState = useMemo(
    () => toReviewBlockingIssueState(blockingIssueCount),
    [blockingIssueCount]
  );

  const focusFlaggedCell = useCallback(
    (rowIndex: number, colIndex: number, canFocusCell: boolean) => {
      if (!canFocusCell) {
        return;
      }

      setTableActiveCell({ row: rowIndex, col: colIndex });
    },
    [setTableActiveCell]
  );

  const focusBlockingIssue = useCallback(
    (issue: TabularReviewIssue) => {
      if (!isFocusableTabularReviewIssue(issue)) {
        return;
      }

      const { colIndex, canFocusCell } = getFlaggedCellPanelData(issue.rowIndex, issue.columnKey);
      focusFlaggedCell(issue.rowIndex, colIndex, canFocusCell);
    },
    [focusFlaggedCell, getFlaggedCellPanelData]
  );

  const unflagCell = useCallback(
    (flag: ReviewFlaggedCellItem) => {
      if (isEditingDisabled) {
        return;
      }

      onRemoveFlag(flag.rowIndex, flag.columnKey);
    },
    [isEditingDisabled, onRemoveFlag]
  );

  useEffect(() => {
    setIsFlaggedPanelOpen(getStoredFlaggedPanelState(reviewTaskId));
  }, [reviewTaskId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!reviewTaskId) {
      return;
    }

    try {
      window.sessionStorage.setItem(getReviewFlaggedPanelStorageKey(reviewTaskId), isFlaggedPanelOpen ? '1' : '0');
    } catch {
      // Ignore storage errors and keep in-memory behavior.
    }
  }, [isFlaggedPanelOpen, reviewTaskId]);

  useEffect(() => {
    if (!onBlockingIssuesChange) {
      return;
    }

    onBlockingIssuesChange(blockingIssueState);
  }, [blockingIssueState, onBlockingIssuesChange]);

  useEffect(() => {
    if (!onBlockingIssuesChange) {
      return;
    }

    return () => {
      onBlockingIssuesChange(EMPTY_REVIEW_BLOCKING_ISSUES);
    };
  }, [onBlockingIssuesChange]);

  const reviewChecksPanelLabel = `${isFlaggedPanelOpen ? 'Close' : 'Open'} review checks panel`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {props.controls || <props.DefaultControls />}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden border-t border-gray-300 bg-white">
        <aside
          className={`shrink-0 border-r border-gray-300 bg-gray-50 transition-[width] duration-200 ease-in-out ${
            isFlaggedPanelOpen ? 'w-[320px]' : 'w-14'
          }`}
        >
          <div className="flex h-full min-h-0">
            <div className="flex w-14 shrink-0 flex-col items-center border-r border-gray-300 bg-white py-2">
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-50"
                onClick={() => setIsFlaggedPanelOpen(previous => !previous)}
                aria-label={reviewChecksPanelLabel}
                title={reviewChecksPanelLabel}
              >
                <FlagIcon className="h-4 w-4" />
                {blockingIssueCount ? (
                  <span className="absolute -right-1 -top-1 rounded border border-red-200 bg-red-100 px-1 text-[10px] font-semibold leading-4 text-red-700">
                    {blockingIssueCount > MAX_BLOCKING_ISSUE_BADGE ? `${MAX_BLOCKING_ISSUE_BADGE}+` : blockingIssueCount}
                  </span>
                ) : null}
              </button>
            </div>

            {isFlaggedPanelOpen ? (
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="border-b border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900">Review checks</div>
                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                  <div>
                    <div className="mb-2 text-sm font-semibold text-red-900">Blocking issues ({blockingIssueCount})</div>
                    {blockingIssueCount ? (
                      <div className="space-y-2">
                        {blockingIssues.map(issue => (
                          <BlockingIssueCard key={issue.id} issue={issue} onFocusIssue={() => focusBlockingIssue(issue)} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                        No blocking issues detected.
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 text-sm font-semibold text-gray-900">Flagged cells ({flaggedCellCount})</div>
                    {flaggedCellsForPanel.length ? (
                      <div className="space-y-2 rounded border border-red-300 bg-red-50 p-2">
                        {flaggedCellsForPanel.map(({ flag, linkedCell, colIndex, canFocusCell }) => (
                          <FlaggedCellCard
                            key={flag.key}
                            flag={flag}
                            linkedCell={linkedCell}
                            canUnflagCell={!isEditingDisabled}
                            onFocusCell={() => focusFlaggedCell(flag.rowIndex, colIndex, canFocusCell)}
                            onUnflagCell={() => unflagCell(flag)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
                        No flagged cells in this document.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
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
              <div className="flex min-h-0 min-w-0 flex-col">
                <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3">
                  {table.status !== 'ready' && !useLegacyTopLevelLayout ? (
                    <div className="rounded border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
                      Table configuration unavailable for this review.
                    </div>
                  ) : (
                    <MaximiseWindow openZIndex={55}>
                      {({ toggle, isOpen }) => (
                        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
                            footerActions={
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                onClick={toggle}
                              >
                                {isOpen ? (
                                  <FullScreenExitIcon className="h-4 w-4" />
                                ) : (
                                  <FullScreenEnterIcon className="h-4 w-4" />
                                )}
                                {isOpen ? 'Exit full screen' : 'Full screen'}
                              </button>
                            }
                          />
                        </div>
                      )}
                    </MaximiseWindow>
                  )}
                </div>
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
