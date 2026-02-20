import React, { useMemo } from 'react';
import type { NetConfig } from '@/frontend/admin/components/tabular/cast-a-net/types';
import { DynamicVaultContext } from '@/frontend/shared/capture-models/new/DynamicVaultContext';
import { RevisionProviderWithFeatures } from '@/frontend/shared/capture-models/new/components/RevisionProviderWithFeatures';
import { useCaptureModelEditorApi } from '@/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { Revisions } from '@/frontend/shared/capture-models/editor/stores/revisions';
import { useLoadedCaptureModel } from '@/frontend/shared/hooks/use-loaded-capture-model';
import { Button, ButtonRow } from '@/frontend/shared/navigation/Button';
import { HrefLink } from '@/frontend/shared/utility/href-link';
import { useCanvasModel } from '@/frontend/site/hooks/use-canvas-model';
import { useCaptureModelContributionLifecycle } from '@/frontend/site/hooks/use-capture-model-contribution-lifecycle';
import { useProject } from '@/frontend/site/hooks/use-project';
import { useRouteContext } from '@/frontend/site/hooks/use-route-context';
import type { CanvasFull } from '@/types/canvas-full';
import { TabularProjectCustomEditorCanvas } from './tabular-project-custom-editor-canvas';
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
      className="grid min-h-0 overflow-hidden"
      style={{
        height: CONTRIBUTOR_EDITOR_SPLIT_HEIGHT,
        maxHeight: CONTRIBUTOR_EDITOR_SPLIT_HEIGHT,
        gridTemplateRows: `minmax(0, ${CONTRIBUTOR_EDITOR_CANVAS_SPLIT}) minmax(0, ${CONTRIBUTOR_EDITOR_TABLE_SPLIT})`,
      }}
    >
      <TabularProjectCustomEditorCanvas
        canvasId={canvasId}
        canvas={canvas}
        netConfig={netConfig}
        activeCell={overlayActiveCell}
        zoomTrackingDefaultEnabled={zoomTrackingDefaultEnabled}
      />

      <div className="min-h-0 overflow-y-auto">
        <div className="flex h-full min-h-0 flex-col gap-4 p-4">
          <div>
            <strong>Tabular editor</strong>
          </div>

          {!netConfig ? (
            <div className="rounded border border-yellow-300 bg-yellow-50 p-2 text-sm">
              No cast-a-net overlay is configured for this project.
            </div>
          ) : null}

          {isLoading ? <div>Loading contribution data...</div> : null}

          {lifecycle.phase === 'error' ? (
            <div>
              <p>Something went wrong while preparing this contribution.</p>
              {lifecycle.lastError ? <pre className="whitespace-pre-wrap">{lifecycle.lastError.message}</pre> : null}
              <ButtonRow>
                <Button onClick={() => lifecycle.refresh()}>Retry</Button>
              </ButtonRow>
            </div>
          ) : null}

          {isBlocked ? <div>{getBlockedReason(lifecycle)}</div> : null}

          {!isLoading && lifecycle.phase !== 'error' && table.status !== 'ready' && !useLegacyTopLevelLayout ? (
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

          {!isLoading && lifecycle.phase !== 'error' && (table.status === 'ready' || useLegacyTopLevelLayout) ? (
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

              <ButtonRow>
                <Button onClick={onSaveForLater} disabled={isEditingDisabled}>
                  {isPersisting && lifecycle.phase === 'saving-draft' ? 'Saving...' : 'Save for later'}
                </Button>
                <Button $primary onClick={onSubmit} disabled={isEditingDisabled}>
                  {isPersisting && lifecycle.phase === 'submitting' ? 'Submitting...' : 'Submit'}
                </Button>
              </ButtonRow>

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
