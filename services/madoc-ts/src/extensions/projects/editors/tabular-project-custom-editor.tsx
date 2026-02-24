import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { NetConfig } from '@/frontend/admin/components/tabular/cast-a-net/types';
import { DynamicVaultContext } from '@/frontend/shared/capture-models/new/DynamicVaultContext';
import { RevisionProviderWithFeatures } from '@/frontend/shared/capture-models/new/components/RevisionProviderWithFeatures';
import { useCaptureModelEditorApi } from '@/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { Revisions } from '@/frontend/shared/capture-models/editor/stores/revisions';
import { useLoadedCaptureModel } from '@/frontend/shared/hooks/use-loaded-capture-model';
import { useResizeLayout } from '@/frontend/shared/hooks/use-resize-layout';
import {
  LayoutContainer,
  LayoutContent,
  LayoutHandle,
  LayoutSidebar,
  OuterLayoutContainer,
} from '@/frontend/shared/layout/LayoutContainer';
import { Button, ButtonRow } from '@/frontend/shared/navigation/Button';
import { HrefLink } from '@/frontend/shared/utility/href-link';
import { useCanvasModel } from '@/frontend/site/hooks/use-canvas-model';
import { useCaptureModelContributionLifecycle } from '@/frontend/site/hooks/use-capture-model-contribution-lifecycle';
import { useProject } from '@/frontend/site/hooks/use-project';
import { useRouteContext } from '@/frontend/site/hooks/use-route-context';
import type { CanvasFull } from '@/types/canvas-full';
import ResizeHandleIcon from '@/frontend/shared/icons/ResizeHandleIcon';
import { TabularProjectCustomEditorCanvas } from './tabular-project-custom-editor-canvas';
import { TabularProjectCustomEditorSidebar } from './tabular-project-custom-editor-sidebar';
import { TabularProjectCustomEditorTable } from './tabular-project-custom-editor-table';
import {
  CONTRIBUTOR_EDITOR_CANVAS_SPLIT,
  CONTRIBUTOR_EDITOR_SPLIT_HEIGHT,
  CONTRIBUTOR_EDITOR_TABLE_SPLIT,
  getBlockedReason,
  netConfigFromSharedStructure,
  type TabularModelColumn,
  type TabularTemplateConfig,
} from './tabular-project-custom-editor-utils';
import { useTabularProjectCustomEditorState } from './use-tabular-project-custom-editor-state';

const CONTRIBUTOR_EDITOR_SPLIT_DIVIDER_HEIGHT = 12;
const CONTRIBUTOR_EDITOR_MIN_CANVAS_HEIGHT = 220;
const CONTRIBUTOR_EDITOR_MIN_TABLE_HEIGHT = 240;

function clampToRange(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

type TabularProjectCustomEditorContentProps = {
  canvasId: number;
  canvas?: CanvasFull['canvas'];
  netConfig: NetConfig | null;
  tabularColumns: TabularModelColumn[];
  zoomTrackingDefaultEnabled: boolean;
};

function TabularProjectCustomEditorContent({
  canvasId,
  canvas,
  netConfig,
  tabularColumns,
  zoomTrackingDefaultEnabled,
}: TabularProjectCustomEditorContentProps) {
  const lifecycle = useCaptureModelContributionLifecycle();
  const table = useCaptureModelEditorApi({ tableProperty: 'rows' });
  const createNewFieldInstance = Revisions.useStoreActions(actions => actions.createNewFieldInstance);
  const removeInstance = Revisions.useStoreActions(actions => actions.removeInstance);

  const isPersisting = lifecycle.phase === 'saving-draft' || lifecycle.phase === 'submitting';
  const isLoading = lifecycle.phase === 'loading' || lifecycle.phase === 'preparing';
  const isBlocked = lifecycle.phase === 'blocked';
  const isEditingDisabled = isBlocked || isPersisting;
  const [isSidebarPanelOpen, setIsSidebarPanelOpen] = useState(true);
  const [isCanvasTableDividerHover, setIsCanvasTableDividerHover] = useState(false);
  const [isCanvasTableResizing, setIsCanvasTableResizing] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);

  const initialCanvasSplit = useMemo(() => {
    const defaultCanvasSplit = Number.parseFloat(CONTRIBUTOR_EDITOR_CANVAS_SPLIT);
    const defaultTableSplit = Number.parseFloat(CONTRIBUTOR_EDITOR_TABLE_SPLIT);
    const safeCanvasSplit = Number.isFinite(defaultCanvasSplit) ? defaultCanvasSplit : 58;
    const safeTableSplit = Number.isFinite(defaultTableSplit) ? defaultTableSplit : 42;
    const total = safeCanvasSplit + safeTableSplit || 100;

    return (safeCanvasSplit / total) * 100;
  }, []);
  const [canvasSplitPct, setCanvasSplitPct] = useState(initialCanvasSplit);

  const startCanvasTableResize = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsCanvasTableResizing(true);

      const splitContainer = splitContainerRef.current;
      if (!splitContainer) {
        setIsCanvasTableResizing(false);
        return;
      }

      const bounds = splitContainer.getBoundingClientRect();
      const availableHeight = Math.max(1, bounds.height - CONTRIBUTOR_EDITOR_SPLIT_DIVIDER_HEIGHT);
      const minCanvasPct = clampToRange((CONTRIBUTOR_EDITOR_MIN_CANVAS_HEIGHT / availableHeight) * 100, 5, 95);
      const maxCanvasPct = clampToRange(100 - (CONTRIBUTOR_EDITOR_MIN_TABLE_HEIGHT / availableHeight) * 100, 5, 95);
      const lowerBound = Math.min(minCanvasPct, maxCanvasPct);
      const upperBound = Math.max(minCanvasPct, maxCanvasPct);
      const startY = event.clientY;
      const startCanvasSplitPct = canvasSplitPct;

      const onMove = (moveEvent: MouseEvent) => {
        const deltaPct = ((moveEvent.clientY - startY) / availableHeight) * 100;
        setCanvasSplitPct(clampToRange(startCanvasSplitPct + deltaPct, lowerBound, upperBound));
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        setIsCanvasTableResizing(false);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [canvasSplitPct]
  );

  const isCanvasTableDividerActive = isCanvasTableDividerHover || isCanvasTableResizing;

  const { widthB, refs } = useResizeLayout('tabular-custom-editor-sidebar', {
    left: true,
    widthB: '420px',
    maxWidthPx: 620,
    minWidthPx: 320,
    onDragEnd: () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resize'));
      }
    },
  });

  const {
    tableActiveCell,
    setTableActiveCell,
    overlayActiveCell,
    columnModel,
    visibleColumns,
    legacyColumnKeys,
    visibleColumnKeys,
    useLegacyTopLevelLayout,
    visibleTableErrors,
    legacyMutableRowCount,
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

  const isTableEditorReady =
    !isLoading && lifecycle.phase !== 'error' && (table.status === 'ready' || useLegacyTopLevelLayout);

  async function onSaveForLater() {
    try {
      await lifecycle.saveForLater();
    } catch {
      /* empty */
    }
  }

  async function onSubmit() {
    try {
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
                gridTemplateRows: `minmax(0, ${canvasSplitPct}fr) ${CONTRIBUTOR_EDITOR_SPLIT_DIVIDER_HEIGHT}px minmax(0, ${
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
              />

              <div
                role="separator"
                aria-orientation="horizontal"
                aria-label="Resize canvas and table"
                onMouseDown={startCanvasTableResize}
                onMouseEnter={() => setIsCanvasTableDividerHover(true)}
                onMouseLeave={() => setIsCanvasTableDividerHover(false)}
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
              </div>

              <div className="flex min-h-0 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className="flex h-full min-h-0 flex-col gap-4">
                    {!netConfig ? (
                      <div className="rounded border border-yellow-300 bg-yellow-50 p-2 text-sm">
                        No cast-a-net overlay is configured for this project.
                      </div>
                    ) : null}

                    {isLoading ? <div>Loading contribution data...</div> : null}

                    {lifecycle.phase === 'error' ? (
                      <div>
                        <p>Something went wrong while preparing this contribution.</p>
                        {lifecycle.lastError ? (
                          <pre className="whitespace-pre-wrap">{lifecycle.lastError.message}</pre>
                        ) : null}
                        <ButtonRow>
                          <Button onClick={() => lifecycle.refresh()}>Retry</Button>
                        </ButtonRow>
                      </div>
                    ) : null}

                    {isBlocked ? <div>{getBlockedReason(lifecycle)}</div> : null}

                    {!isLoading &&
                    lifecycle.phase !== 'error' &&
                    table.status !== 'ready' &&
                    !useLegacyTopLevelLayout ? (
                      <div>
                        <p>Table configuration is unavailable.</p>
                        {visibleTableErrors.length ? (
                          <pre className="whitespace-pre-wrap">{visibleTableErrors.join('\n')}</pre>
                        ) : null}
                        {lifecycle.needsRevisionSelection ? (
                          <Button onClick={() => lifecycle.ensureRevision()}>Try selecting revision</Button>
                        ) : null}
                      </div>
                    ) : null}

                    {isTableEditorReady ? (
                      <>
                        <TabularProjectCustomEditorTable
                          table={table}
                          columnLabels={columnModel.labels}
                          columnHints={columnModel.hints}
                          visibleColumns={visibleColumns}
                          visibleColumnKeys={visibleColumnKeys}
                          legacyColumnKeys={legacyColumnKeys}
                          legacyMutableRowCount={legacyMutableRowCount}
                          useLegacyTopLevelLayout={useLegacyTopLevelLayout}
                          tableActiveCell={tableActiveCell}
                          onActiveCellChange={setTableActiveCell}
                          disabled={isEditingDisabled}
                          canAddRow={canAddRow}
                          canRemoveRow={canRemoveRow}
                          addRowFromFooter={addRowFromFooter}
                          removeRowFromFooter={removeRowFromFooter}
                          onCreateLegacyField={(columnKey: string) => {
                            try {
                              createNewFieldInstance({
                                path: [],
                                property: columnKey,
                                multipleOverride: true,
                              });
                            } catch {
                              // Error is surfaced through table.errors from helper hooks.
                            }
                          }}
                        />

                        {!(useLegacyTopLevelLayout ? legacyColumnKeys.length : visibleColumns.length) ? (
                          <div className="rounded border border-red-200 bg-red-50 p-2 text-sm">
                            No visible table columns were found for this project template.
                          </div>
                        ) : null}

                        {lifecycle.phase === 'submitted' ? <div>Contribution submitted.</div> : null}
                      </>
                    ) : null}

                    {lifecycle.nextCanvas.hasNext && lifecycle.nextCanvas.next ? (
                      <ButtonRow>
                        <HrefLink href={lifecycle.nextCanvas.next.href}>Next image</HrefLink>
                      </ButtonRow>
                    ) : null}

                    {visibleTableErrors.length ? (
                      <pre className="whitespace-pre-wrap">{visibleTableErrors.join('\n')}</pre>
                    ) : null}
                    {lifecycle.lastError && lifecycle.phase !== 'error' ? (
                      <pre className="whitespace-pre-wrap">{lifecycle.lastError.message}</pre>
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
  const netConfig = useMemo(() => netConfigFromSharedStructure(tabularStructure), [tabularStructure]);
  const tabularColumns = (templateConfig?.tabular?.model?.columns || []) as TabularModelColumn[];
  const { data: projectModel } = useCanvasModel();
  const [{ captureModel, canvas }] = useLoadedCaptureModel(projectModel?.model?.id, undefined, canvasId);

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
        />
      </RevisionProviderWithFeatures>
    </DynamicVaultContext>
  );
}
