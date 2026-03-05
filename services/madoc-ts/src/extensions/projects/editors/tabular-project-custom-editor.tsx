import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NetConfig } from '@/frontend/shared/utility/tabular-types';
import { DynamicVaultContext } from '@/frontend/shared/capture-models/new/DynamicVaultContext';
import { RevisionProviderWithFeatures } from '@/frontend/shared/capture-models/new/components/RevisionProviderWithFeatures';
import { useCaptureModelEditorApi } from '@/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { Revisions } from '@/frontend/shared/capture-models/editor/stores/revisions';
import { useApi } from '@/frontend/shared/hooks/use-api';
import { useLoadedCaptureModel } from '@/frontend/shared/hooks/use-loaded-capture-model';
import { VerticalResizeSeparator } from '@/frontend/shared/components/VerticalResizeSeparator';
import { clampToRange } from '@/frontend/shared/utility/tabular-net-config';
import {
  LayoutContainer,
  LayoutContent,
  LayoutHandle,
  LayoutSidebar,
  OuterLayoutContainer,
} from '@/frontend/shared/layout/LayoutContainer';
import { Button, ButtonRow } from '@/frontend/shared/navigation/Button';
import { useCanvasModel } from '@/frontend/site/hooks/use-canvas-model';
import { useCaptureModelContributionLifecycle } from '@/frontend/site/hooks/use-capture-model-contribution-lifecycle';
import { useProject } from '@/frontend/site/hooks/use-project';
import { useRouteContext } from '@/frontend/site/hooks/use-route-context';
import type { CanvasFull } from '@/types/canvas-full';
import ResizeHandleIcon from '@/frontend/shared/icons/ResizeHandleIcon';
import { buildCastANetStructure } from '../../../frontend/admin/components/tabular/cast-a-net/CastANetStructure';
import { TabularProjectCustomEditorCanvas } from './tabular-project-custom-editor-canvas';
import { ContributionEditorStateAlerts } from './contribution-editor-state-alerts';
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
    areNumberArraysEqual(left.colPositions || [], right.colPositions || [])
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
  const lifecycle = useCaptureModelContributionLifecycle();
  const { projectId } = useRouteContext();
  const table = useCaptureModelEditorApi({ tableProperty: 'rows' });
  const createNewFieldInstance = Revisions.useStoreActions(actions => actions.createNewFieldInstance);
  const removeInstance = Revisions.useStoreActions(actions => actions.removeInstance);
  const sharedNetConfigRef = useRef<NetConfig | null>(initialNetConfig);
  const [netSyncError, setNetSyncError] = useState<string | null>(null);

  const isPersisting = lifecycle.phase === 'saving-draft' || lifecycle.phase === 'submitting';
  const isLoading = lifecycle.phase === 'loading' || lifecycle.phase === 'preparing';
  const isBlocked = lifecycle.phase === 'blocked';
  const isEditingDisabled = isBlocked || isPersisting;
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

  async function onSaveForLater() {
    try {
      await lifecycle.saveForLater();
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
      onNetConfigChange({
        ...netConfig,
        top: clampToRange(netConfig.top + deltaY, 0, 100 - netConfig.height),
      });
    },
    [netConfig, onNetConfigChange]
  );

  const syncSharedNetConfig = useCallback(async () => {
    if (!netConfig || !templateConfig?.tabular || !projectId) {
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
  }, [api, netConfig, projectId, templateConfig]);

  async function onSubmit() {
    try {
      await syncSharedNetConfig();
      await lifecycle.submit();
    } catch {
      /* empty */
    }
  }

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
            <div
              ref={splitContainerRef}
              className="grid min-h-0 min-w-0 flex-1 overflow-hidden"
              style={{
                gridTemplateRows: `minmax(0, ${canvasSplitPct}fr) ${splitDividerHeight}px minmax(0, ${
                  100 - canvasSplitPct
                }fr)`,
              }}
            >
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

              <VerticalResizeSeparator
                ariaLabel="Resize canvas and table"
                onResizeStart={startCanvasTableResize}
                onHoverChange={setIsCanvasTableDividerHover}
                className="flex items-center justify-center"
                style={{
                  cursor: 'row-resize',
                  userSelect: 'none',
                  background: isCanvasTableDividerActive ? '#a1a1a1' : '#ddd',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gap: 2,
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 2,
                      background: isCanvasTableDividerActive ? '#181818' : '#a1a1a1',
                    }}
                  />
                  <div
                    style={{
                      width: 16,
                      height: 2,
                      background: isCanvasTableDividerActive ? '#181818' : '#a1a1a1',
                    }}
                  />
                </div>
              </VerticalResizeSeparator>

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
                      onRetry={() => lifecycle.refresh()}
                      onEnsureRevision={() => lifecycle.ensureRevision()}
                    />

                    {isTableEditorReady ? (
                      <>
                        <TabularProjectCustomEditorTable
                          headerColumns={headerColumns}
                          rows={tableRows}
                          showEmptyState={showEmptyTableState}
                          tableActiveCell={tableActiveCell}
                          onActiveCellChange={setTableActiveCell}
                          disabled={isEditingDisabled}
                          canAddRow={canAddRow}
                          canRemoveRow={canRemoveRow}
                          addRowFromFooter={addRowFromFooter}
                          removeRowFromFooter={removeRowAndSyncFlags}
                          isCellFlagged={isCellFlagged}
                        />

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
                    {lifecycle.lastError && lifecycle.phase !== 'error' ? (
                      <pre className="whitespace-pre-wrap">{lifecycle.lastError.message}</pre>
                    ) : null}
                    {netSyncError ? <pre className="whitespace-pre-wrap">{netSyncError}</pre> : null}
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
            </div>
          </LayoutContent>
        </LayoutContainer>
      </OuterLayoutContainer>
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
