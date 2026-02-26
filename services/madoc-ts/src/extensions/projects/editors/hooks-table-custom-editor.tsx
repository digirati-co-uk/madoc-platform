import React from 'react';
import { DynamicVaultContext } from '../../../frontend/shared/capture-models/new/DynamicVaultContext';
import { EditorContentViewer } from '../../../frontend/shared/capture-models/new/EditorContent';
import { RevisionProviderWithFeatures } from '../../../frontend/shared/capture-models/new/components/RevisionProviderWithFeatures';
import { useCaptureModelEditorApi } from '../../../frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { Button, ButtonRow } from '../../../frontend/shared/navigation/Button';
import { useLoadedCaptureModel } from '../../../frontend/shared/hooks/use-loaded-capture-model';
import { useCanvasModel } from '../../../frontend/site/hooks/use-canvas-model';
import { useCaptureModelContributionLifecycle } from '../../../frontend/site/hooks/use-capture-model-contribution-lifecycle';
import { useRouteContext } from '../../../frontend/site/hooks/use-route-context';
import { HrefLink } from '@/frontend/shared/utility/href-link';
import { HooksTableGridRenderer, HooksTableTopLevelFieldsModalButton } from './hooks-table-grid-renderer';
import { ContributionEditorStateAlerts } from './contribution-editor-state-alerts';
import { getBlockedReason } from './tabular-project-custom-editor-utils';

function HooksTableCustomEditorContent({ canvasId, canvas }: { canvasId: number; canvas: unknown }) {
  const lifecycle = useCaptureModelContributionLifecycle();
  const table = useCaptureModelEditorApi({ tableProperty: 'rows' });

  const isPersisting = lifecycle.phase === 'saving-draft' || lifecycle.phase === 'submitting';
  const isLoading = lifecycle.phase === 'loading' || lifecycle.phase === 'preparing';
  const isBlocked = lifecycle.phase === 'blocked';

  async function onSaveForLater() {
    try {
      await lifecycle.saveForLater();
    } catch {
      // error
    }
  }

  async function onSubmit() {
    try {
      await lifecycle.submit();
    } catch {
      // error
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 basis-1/2 border-b border-gray-300">
        <EditorContentViewer canvasId={canvasId} canvas={canvas} />
      </div>
      <div className="min-h-0 basis-1/2 overflow-auto">
        <div className="flex flex-col gap-4 p-4">
          <div>
            <strong>Hooks table editor</strong>
          </div>

          <ContributionEditorStateAlerts
            isLoading={isLoading}
            isError={lifecycle.phase === 'error'}
            lastErrorMessage={lifecycle.lastError?.message}
            isBlocked={isBlocked}
            blockedReason={getBlockedReason(lifecycle)}
            showTableUnavailable={!isLoading && lifecycle.phase !== 'error' && table.status !== 'ready'}
            tableErrors={table.errors}
            needsRevisionSelection={lifecycle.needsRevisionSelection}
            onRetry={() => lifecycle.refresh()}
            onEnsureRevision={() => lifecycle.ensureRevision()}
          />

          {!isLoading && lifecycle.phase !== 'error' && table.status === 'ready' ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => table.addRow()} disabled={isBlocked || isPersisting} title="Add a new table row">
                  Add row
                </Button>
                <HooksTableTopLevelFieldsModalButton table={table} mode="write" disabled={isBlocked || isPersisting} />
              </div>

              <HooksTableGridRenderer table={table} mode="write" disabled={isBlocked || isPersisting} />

              <ButtonRow>
                <Button onClick={onSaveForLater} disabled={isBlocked || isPersisting}>
                  {isPersisting && lifecycle.phase === 'saving-draft' ? 'Saving...' : 'Save for later'}
                </Button>
                <Button $primary onClick={onSubmit} disabled={isBlocked || isPersisting}>
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

          {table.errors.length ? <pre className="whitespace-pre-wrap">{table.errors.join('\n')}</pre> : null}
          {lifecycle.lastError && lifecycle.phase !== 'error' ? (
            <pre className="whitespace-pre-wrap">{lifecycle.lastError.message}</pre>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function HooksTableCustomEditor() {
  const { canvasId } = useRouteContext();
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
        <HooksTableCustomEditorContent canvasId={canvasId} canvas={canvas} />
      </RevisionProviderWithFeatures>
    </DynamicVaultContext>
  );
}
