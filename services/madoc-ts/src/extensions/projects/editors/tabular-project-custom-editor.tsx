import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NetConfig } from '@/frontend/shared/utility/tabular-types';
import { DynamicVaultContext } from '@/frontend/shared/capture-models/new/DynamicVaultContext';
import { RevisionProviderWithFeatures } from '@/frontend/shared/capture-models/new/components/RevisionProviderWithFeatures';
import { useCaptureModelEditorApi } from '@/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { Revisions } from '@/frontend/shared/capture-models/editor/stores/revisions';
import { useApi } from '@/frontend/shared/hooks/use-api';
import { useLoadedCaptureModel } from '@/frontend/shared/hooks/use-loaded-capture-model';
import { addTabularRowOffsetAdjustment } from '@/frontend/shared/utility/tabular-row-offset-adjustments';
import {
  LayoutContainer,
  LayoutContent,
  LayoutHandle,
  LayoutSidebar,
  OuterLayoutContainer,
} from '@/frontend/shared/layout/LayoutContainer';
import { MaximiseWindow } from '@/frontend/shared/layout/MaximiseWindow';
import { Button, ButtonRow } from '@/frontend/shared/navigation/Button';
import { useCanvasModel } from '@/frontend/site/hooks/use-canvas-model';
import { useCaptureModelContributionLifecycle } from '@/frontend/site/hooks/use-capture-model-contribution-lifecycle';
import { useProject } from '@/frontend/site/hooks/use-project';
import { useRouteContext } from '@/frontend/site/hooks/use-route-context';
import type { CanvasFull } from '@/types/canvas-full';
import { FullScreenEnterIcon } from '@/frontend/shared/icons/FullScreenEnterIcon';
import { FullScreenExitIcon } from '@/frontend/shared/icons/FullScreenExitIcon';
import ResizeHandleIcon from '@/frontend/shared/icons/ResizeHandleIcon';
import { buildCastANetStructure } from '@/frontend/admin/components/tabular/cast-a-net/CastANetStructure';
import { TabularContributorSplitView } from './tabular-contributor-split-view';
import { TabularProjectCustomEditorCanvas } from './tabular-project-custom-editor-canvas';
import { ContributionEditorStateAlerts } from './contribution-editor-state-alerts';
import { ContributionSuccessModal } from './contribution-success-modal';
import { TabularProjectCustomEditorSidebar } from './tabular-project-custom-editor-sidebar';
import { TabularProjectCustomEditorTable } from './tabular-project-custom-editor-table';
import {
  CONTRIBUTOR_EDITOR_SPLIT_HEIGHT,
  getBlockedReason,
  netConfigFromSharedStructure,
  type TabularModelColumn,
  type TabularTemplateConfig,
} from './tabular-project-custom-editor-utils';
import { useTabularCellFlags } from './use-tabular-cell-flags';
import { useTabularEditorLayout } from './use-tabular-editor-layout';
import { useTabularProjectCustomEditorState } from './use-tabular-project-custom-editor-state';
import type { TabularEditorRowModel } from './tabular-project-custom-editor-table-model';

type TabularProjectCustomEditorContentProps = {
  canvasId: number;
  canvas?: CanvasFull['canvas'];
  netConfig: NetConfig | null;
  tabularColumns: TabularModelColumn[];
  zoomTrackingDefaultEnabled: boolean;
  initialNetConfig: NetConfig | null;
  onNetConfigChange: (next: NetConfig) => void;
  templateConfig?: TabularTemplateConfig;
};

const CONTRIBUTOR_NET_NUDGE_STEP = 0.25;
const TABULAR_CONTRIBUTOR_BASE_ROW_COUNT = 5;

function getRowRemovalWarning(row: TabularEditorRowModel, flaggedCells: Array<{ rowIndex: number }>): string | null {
  const hasFlaggedCell = flaggedCells.some(flag => flag.rowIndex === row.rowIndex);
  if (hasFlaggedCell) {
    return 'Rows with flagged cells cannot be removed. Unflag flagged cells in this row first.';
  }

  const hasNonEmptyCell = row.cells.some(cell => typeof cell.value === 'string' && cell.value.trim().length > 0);
  if (hasNonEmptyCell) {
    return 'Rows can only be removed when empty. Clear all cell values first.';
  }

  return null;
}

function areNumberArraysEqual(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

function areRowOffsetAdjustmentsEqual(
  left: NetConfig['rowOffsetAdjustments'],
  right: NetConfig['rowOffsetAdjustments']
) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (
      left[index].startRow !== right[index].startRow ||
      left[index].offsetPctOfPage !== right[index].offsetPctOfPage
    ) {
      return false;
    }
  }

  return true;
}

function areNetConfigsEqual(left: NetConfig | null, right: NetConfig | null) {
  if (!left || !right) {
    return left === right;
  }

  return (
    left.rows === right.rows &&
    left.cols === right.cols &&
    left.top === right.top &&
    left.left === right.left &&
    left.width === right.width &&
    left.height === right.height &&
    areNumberArraysEqual(left.rowPositions || [], right.rowPositions || []) &&
    areNumberArraysEqual(left.colPositions || [], right.colPositions || []) &&
    areRowOffsetAdjustmentsEqual(left.rowOffsetAdjustments || [], right.rowOffsetAdjustments || [])
  );
}

function TabularProjectCustomEditorContent({
  canvasId,
  canvas,
  netConfig,
  tabularColumns,
  zoomTrackingDefaultEnabled,
  initialNetConfig,
  onNetConfigChange,
  templateConfig,
}: TabularProjectCustomEditorContentProps) {
  const api = useApi();
  const currentUser = api.getIsServer() ? undefined : api.getCurrentUser();
  const isSiteAdmin = !!currentUser?.scope?.includes('site.admin');
  const lifecycle = useCaptureModelContributionLifecycle();
  const { projectId } = useRouteContext();
  const table = useCaptureModelEditorApi({ tableProperty: 'rows' });
  const currentRevisionId = Revisions.useStoreState(state => state.currentRevisionId);
  const currentRevisionStatus = Revisions.useStoreState(state => state.currentRevision?.revision.status);
  const createNewFieldInstance = Revisions.useStoreActions(actions => actions.createNewFieldInstance);
  const deselectRevision = Revisions.useStoreActions(actions => actions.deselectRevision);
  const removeInstance = Revisions.useStoreActions(actions => actions.removeInstance);
  const sharedNetConfigRef = useRef<NetConfig | null>(initialNetConfig);
  const seededBaseRowsRevisionRef = useRef<string | null>(null);
  const [netSyncError, setNetSyncError] = useState<string | null>(null);
  const [successModalState, setSuccessModalState] = useState<'saved' | 'submitted' | null>(null);
  const [rowRemovalWarning, setRowRemovalWarning] = useState<string | null>(null);

  const isPersisting = lifecycle.phase === 'saving-draft' || lifecycle.phase === 'submitting';
  const isLoading = lifecycle.phase === 'loading' || lifecycle.phase === 'preparing';
  const isBlocked = lifecycle.phase === 'blocked';
  const isSubmittedRevision = currentRevisionStatus === 'submitted';
  const isEditingDisabled = isBlocked || isPersisting || isSubmittedRevision;
  const canStartAnotherSubmission =
    !lifecycle.preventFurtherSubmission && lifecycle.canContribute && lifecycle.canUserSubmit;
  const {
    widthB,
    refs,
    isSidebarPanelOpen,
    setIsSidebarPanelOpen,
    splitContainerRef,
    canvasSplitPct,
    startCanvasTableResize,
    isCanvasTableDividerActive,
    setIsCanvasTableDividerHover,
    splitDividerHeight,
  } = useTabularEditorLayout();

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

  const {
    canPersistFlags,
    activeCellColumnKey,
    activeCellColumnLabel,
    activeCellIsFlagged,
    activeCellComment,
    flaggedCells,
    isCellFlagged,
    onToggleActiveCellFlag,
    onUpdateActiveCellComment,
    onFocusFlaggedCell,
    onRemoveFlag,
    onClearAllFlags,
    removeRowAndSyncFlags,
  } = useTabularCellFlags({
    table,
    projectId,
    canvasId,
    visibleColumnKeys,
    headerColumns,
    tableActiveCell,
    setTableActiveCell,
    useLegacyTopLevelLayout,
    removeRowFromFooter,
  });

  const isTableEditorReady =
    !isLoading && lifecycle.phase !== 'error' && (table.status === 'ready' || useLegacyTopLevelLayout);

  useEffect(() => {
    sharedNetConfigRef.current = initialNetConfig;
  }, [initialNetConfig]);

  useEffect(() => {
    if (!lifecycle.revisionId) {
      seededBaseRowsRevisionRef.current = null;
      return;
    }

    if (isEditingDisabled || !isTableEditorReady) {
      return;
    }

    if (seededBaseRowsRevisionRef.current === lifecycle.revisionId) {
      return;
    }

    const currentRowCount = useLegacyTopLevelLayout ? tableRows.length : table.rowCount;
    const rowsToAdd = TABULAR_CONTRIBUTOR_BASE_ROW_COUNT - currentRowCount;

    if (rowsToAdd > 0) {
      if (!canAddRow) {
        return;
      }

      for (let rowIndex = 0; rowIndex < rowsToAdd; rowIndex += 1) {
        addRowFromFooter();
      }
    }

    seededBaseRowsRevisionRef.current = lifecycle.revisionId;
  }, [
    addRowFromFooter,
    canAddRow,
    isEditingDisabled,
    isTableEditorReady,
    lifecycle.revisionId,
    table.rowCount,
    tableRows.length,
    useLegacyTopLevelLayout,
  ]);

  async function onSaveForLater() {
    if (isSubmittedRevision) {
      return;
    }

    try {
      await lifecycle.saveForLater();
      setSuccessModalState('saved');
    } catch {
      /* empty */
    }
  }

  const nudgeNetVertical = useCallback(
    (deltaY: number) => {
      if (!netConfig) {
        return;
      }

      setNetSyncError(null);

      const fallbackAnchorRow = Math.max(0, Math.floor(netConfig.rows || 0));
      const anchorRow = overlayActiveCell?.row ?? fallbackAnchorRow;
      if (Number.isFinite(anchorRow) && anchorRow >= 0 && deltaY !== 0) {
        onNetConfigChange({
          ...netConfig,
          rowOffsetAdjustments: addTabularRowOffsetAdjustment(netConfig.rowOffsetAdjustments, anchorRow, deltaY),
        });
      }
    },
    [netConfig, onNetConfigChange, overlayActiveCell]
  );

  const syncSharedNetConfig = useCallback(async () => {
    if (!netConfig || !templateConfig?.tabular || !projectId) {
      return;
    }

    if (!isSiteAdmin) {
      setNetSyncError(null);
      return;
    }

    if (areNetConfigsEqual(sharedNetConfigRef.current, netConfig)) {
      return;
    }

    const structure = buildCastANetStructure(netConfig, {
      blankColumnIndexes: templateConfig.tabular.structure?.blankColumnIndexes,
    });

    const nextTemplateConfig: TabularTemplateConfig = {
      ...templateConfig,
      tabular: {
        ...templateConfig.tabular,
        structure: {
          ...(templateConfig.tabular.structure || {}),
          topLeft: structure.topLeft,
          topRight: structure.topRight,
          marginsPct: structure.marginsPct,
          columnCount: structure.columnCount,
          columnWidthsPctOfPage: structure.columnWidthsPctOfPage,
          rowHeightsPctOfPage: structure.rowHeightsPctOfPage,
          rowOffsetAdjustments: structure.rowOffsetAdjustments,
          blankColumnIndexes: structure.blankColumnIndexes,
        },
      },
    };

    try {
      await api.updateProjectTemplateConfig(projectId, nextTemplateConfig);
      sharedNetConfigRef.current = netConfig;
      setNetSyncError(null);
    } catch {
      // Keep submission working even when user cannot update project-level config.
      setNetSyncError('Could not sync zoom tracking coordinates for other contributors.');
    }
  }, [api, isSiteAdmin, netConfig, projectId, templateConfig]);

  async function onSubmit() {
    if (isSubmittedRevision) {
      return;
    }

    try {
      await syncSharedNetConfig();
      await lifecycle.submit();
      setSuccessModalState('submitted');
    } catch {
      /* empty */
    }
  }

  const onContinueAfterSuccess = useCallback(() => {
    if (successModalState !== 'submitted' || !canStartAnotherSubmission) {
      return;
    }

    if (currentRevisionId) {
      deselectRevision({ revisionId: currentRevisionId });
    }

    void lifecycle.ensureRevision().catch(() => {
      /* empty */
    });
  }, [canStartAnotherSubmission, currentRevisionId, deselectRevision, lifecycle, successModalState]);

  const getTargetRowForRemoval = useCallback(() => {
    const selectedRow = tableActiveCell?.row;
    const selectedMatch =
      typeof selectedRow === 'number' ? tableRows.find(row => row.rowIndex === selectedRow) : undefined;
    return selectedMatch || tableRows[tableRows.length - 1];
  }, [tableActiveCell, tableRows]);

  const removeEmptyRowAndSyncFlags = useCallback(() => {
    const targetRow = getTargetRowForRemoval();
    if (!targetRow) {
      return;
    }

    const warning = getRowRemovalWarning(targetRow, flaggedCells);
    if (warning) {
      setRowRemovalWarning(warning);
      return;
    }

    setRowRemovalWarning(null);
    removeRowAndSyncFlags();
  }, [flaggedCells, getTargetRowForRemoval, removeRowAndSyncFlags]);

  useEffect(() => {
    if (!rowRemovalWarning) {
      return;
    }

    const targetRow = getTargetRowForRemoval();
    if (!targetRow) {
      setRowRemovalWarning(null);
      return;
    }

    const warning = getRowRemovalWarning(targetRow, flaggedCells);
    if (!warning) {
      setRowRemovalWarning(null);
      return;
    }

    if (warning !== rowRemovalWarning) {
      setRowRemovalWarning(warning);
    }
  }, [flaggedCells, getTargetRowForRemoval, rowRemovalWarning]);

  return (
    <div
      className="min-h-0 overflow-hidden"
      style={{
        height: CONTRIBUTOR_EDITOR_SPLIT_HEIGHT,
        maxHeight: CONTRIBUTOR_EDITOR_SPLIT_HEIGHT,
      }}
    >
      <OuterLayoutContainer style={{ height: '100%', minHeight: 0 }}>
        <LayoutContainer ref={refs.container as any} style={{ height: '100%', minHeight: 0 }}>
          <LayoutSidebar
            ref={refs.resizableDiv as any}
            $noScroll
            style={{
              width: isSidebarPanelOpen ? widthB : 56,
              minWidth: isSidebarPanelOpen ? 320 : 56,
              height: '100%',
              borderRight: 'none',
            }}
          >
            <TabularProjectCustomEditorSidebar
              isPanelOpen={isSidebarPanelOpen}
              onPanelOpenChange={setIsSidebarPanelOpen}
              activeCell={tableActiveCell}
              activeCellColumnKey={activeCellColumnKey}
              activeCellColumnLabel={activeCellColumnLabel}
              activeCellIsFlagged={activeCellIsFlagged}
              activeCellComment={activeCellComment}
              flaggedCells={flaggedCells}
              visibleColumnKeys={visibleColumnKeys}
              canPersistFlags={canPersistFlags}
              onToggleActiveCellFlag={onToggleActiveCellFlag}
              onUpdateActiveCellComment={onUpdateActiveCellComment}
              onFocusFlaggedCell={onFocusFlaggedCell}
              onRemoveFlag={onRemoveFlag}
              onClearAllFlags={onClearAllFlags}
            />
          </LayoutSidebar>
          <LayoutHandle
            ref={refs.resizer as any}
            style={{
              width: isSidebarPanelOpen ? 12 : 0,
              minWidth: isSidebarPanelOpen ? 12 : 0,
              opacity: isSidebarPanelOpen ? 1 : 0,
              pointerEvents: isSidebarPanelOpen ? 'auto' : 'none',
            }}
            aria-hidden={!isSidebarPanelOpen}
          >
            <ResizeHandleIcon />
          </LayoutHandle>
          <LayoutContent
            style={{
              minWidth: 0,
              minHeight: 0,
            }}
          >
            <TabularContributorSplitView
              splitContainerRef={splitContainerRef}
              canvasSplitPct={canvasSplitPct}
              splitDividerHeight={splitDividerHeight}
              startCanvasTableResize={startCanvasTableResize}
              isCanvasTableDividerActive={isCanvasTableDividerActive}
              setIsCanvasTableDividerHover={setIsCanvasTableDividerHover}
              topPanel={
                <TabularProjectCustomEditorCanvas
                  canvasId={canvasId}
                  canvas={canvas}
                  netConfig={netConfig}
                  activeCell={overlayActiveCell}
                  zoomTrackingDefaultEnabled={zoomTrackingDefaultEnabled}
                  showVerticalNudgeControls={!!netConfig}
                  onNudgeUp={() => nudgeNetVertical(-CONTRIBUTOR_NET_NUDGE_STEP)}
                  onNudgeDown={() => nudgeNetVertical(CONTRIBUTOR_NET_NUDGE_STEP)}
                  nudgeDisabled={isPersisting || isBlocked}
                />
              }
              bottomPanel={
                <div className="flex min-h-0 min-w-0 flex-col">
                  <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="flex h-full min-h-0 min-w-0 flex-col gap-4">
                      {!netConfig ? (
                        <div className="rounded border border-yellow-300 bg-yellow-50 p-2 text-sm">
                          No cast-a-net overlay is configured for this project.
                        </div>
                      ) : null}

                      <ContributionEditorStateAlerts
                        isLoading={isLoading}
                        isError={lifecycle.phase === 'error'}
                        lastErrorMessage={lifecycle.lastError?.message}
                        isBlocked={isBlocked}
                        blockedReason={getBlockedReason(lifecycle)}
                        showTableUnavailable={
                          !isLoading &&
                          lifecycle.phase !== 'error' &&
                          table.status !== 'ready' &&
                          !useLegacyTopLevelLayout
                        }
                        tableErrors={visibleTableErrors}
                        needsRevisionSelection={lifecycle.needsRevisionSelection}
                        onRetry={() => lifecycle.prepare()}
                        onEnsureRevision={() => lifecycle.ensureRevision()}
                      />

                      {isTableEditorReady ? (
                        <>
                          {rowRemovalWarning ? (
                            <div className="rounded border border-yellow-300 bg-yellow-50 p-2 text-sm text-yellow-900">
                              {rowRemovalWarning}
                            </div>
                          ) : null}

                          <MaximiseWindow openZIndex={55}>
                            {({ toggle, isOpen }) => (
                              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                                <TabularProjectCustomEditorTable
                                  headerColumns={headerColumns}
                                  rows={tableRows}
                                  showEmptyState={showEmptyTableState}
                                  showRowControls={!isOpen}
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
                                  tableActiveCell={tableActiveCell}
                                  onActiveCellChange={setTableActiveCell}
                                  disabled={isEditingDisabled}
                                  canAddRow={canAddRow}
                                  canRemoveRow={canRemoveRow}
                                  addRowFromFooter={addRowFromFooter}
                                  removeRowFromFooter={removeEmptyRowAndSyncFlags}
                                  isCellFlagged={isCellFlagged}
                                />
                              </div>
                            )}
                          </MaximiseWindow>

                          {headerColumns.length === 0 ? (
                            <div className="rounded border border-red-200 bg-red-50 p-2 text-sm">
                              No visible table columns were found for this project template.
                            </div>
                          ) : null}
                        </>
                      ) : null}

                      {visibleTableErrors.length ? (
                        <pre className="whitespace-pre-wrap">{visibleTableErrors.join('\n')}</pre>
                      ) : null}
                      {lifecycle.lastError && lifecycle.lastErrorStage === 'save' && lifecycle.phase !== 'error' ? (
                        <div className="rounded border border-red-200 bg-red-50 p-2 text-sm">
                          <p>Could not save your latest changes. Please try again.</p>
                          <pre className="whitespace-pre-wrap">{lifecycle.lastError.message}</pre>
                        </div>
                      ) : null}
                      {netSyncError ? <pre className="whitespace-pre-wrap">{netSyncError}</pre> : null}
                      {isSubmittedRevision ? (
                        <div className="rounded border border-blue-200 bg-blue-50 p-2 text-sm">
                          This submission has already been submitted and cannot be edited.
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {isTableEditorReady ? (
                    <div className="border-t border-gray-300 bg-gray-100 px-3 py-2">
                      <ButtonRow $noMargin>
                        <Button onClick={onSaveForLater} disabled={isEditingDisabled}>
                          {isPersisting && lifecycle.phase === 'saving-draft' ? 'Saving...' : 'Save for later'}
                        </Button>
                        <Button $primary onClick={onSubmit} disabled={isEditingDisabled}>
                          {isPersisting && lifecycle.phase === 'submitting' ? 'Submitting...' : 'Submit'}
                        </Button>
                      </ButtonRow>
                    </div>
                  ) : null}
                </div>
              }
            />
          </LayoutContent>
        </LayoutContainer>
      </OuterLayoutContainer>
      {successModalState ? (
        <ContributionSuccessModal
          mode={successModalState}
          nextImageHref={lifecycle.nextCanvas.next?.href}
          showContinueWorking={successModalState !== 'submitted' || canStartAnotherSubmission}
          onContinueWorking={onContinueAfterSuccess}
          onClose={() => setSuccessModalState(null)}
        />
      ) : null}
    </div>
  );
}

export function TabularProjectCustomEditor() {
  const { canvasId } = useRouteContext();
  const { data: project } = useProject();
  const templateConfig = project?.template_config as TabularTemplateConfig | undefined;
  const tabularStructure = templateConfig?.tabular?.structure;
  const initialNetConfig = useMemo(() => netConfigFromSharedStructure(tabularStructure), [tabularStructure]);
  const [netConfig, setNetConfig] = useState<NetConfig | null>(initialNetConfig);
  const tabularColumns = (templateConfig?.tabular?.model?.columns || []) as TabularModelColumn[];
  const { data: projectModel } = useCanvasModel();
  const [{ captureModel, canvas }] = useLoadedCaptureModel(projectModel?.model?.id, undefined, canvasId);

  useEffect(() => {
    setNetConfig(initialNetConfig);
  }, [initialNetConfig]);

  if (!canvasId) {
    return null;
  }

  return (
    <DynamicVaultContext canvasId={canvasId}>
      <RevisionProviderWithFeatures
        captureModel={captureModel}
        features={{
          autosave: false,
          autoSelectingRevision: true,
          revisionEditMode: true,
          directEdit: false,
        }}
        slotConfig={{
          editor: {
            allowEditing: true,
            deselectRevisionAfterSaving: false,
            saveOnNavigate: false,
          },
        }}
      >
        <TabularProjectCustomEditorContent
          canvasId={canvasId}
          canvas={canvas}
          netConfig={netConfig}
          tabularColumns={tabularColumns}
          zoomTrackingDefaultEnabled={templateConfig?.enableZoomTracking !== false}
          initialNetConfig={initialNetConfig}
          onNetConfigChange={next => setNetConfig(next)}
          templateConfig={templateConfig}
        />
      </RevisionProviderWithFeatures>
    </DynamicVaultContext>
  );
}
