import React, { useState } from 'react';
import { DynamicVaultContext } from '../../../frontend/shared/capture-models/new/DynamicVaultContext';
import { EditorContentViewer } from '../../../frontend/shared/capture-models/new/EditorContent';
import { RevisionProviderWithFeatures } from '../../../frontend/shared/capture-models/new/components/RevisionProviderWithFeatures';
import { useCaptureModelEditorApi } from '../../../frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { Revisions } from '../../../frontend/shared/capture-models/editor/stores/revisions';
import { Button, ButtonRow } from '../../../frontend/shared/navigation/Button';
import { useLoadedCaptureModel } from '../../../frontend/shared/hooks/use-loaded-capture-model';
import { useCanvasModel } from '../../../frontend/site/hooks/use-canvas-model';
import { useCaptureModelContributionLifecycle } from '../../../frontend/site/hooks/use-capture-model-contribution-lifecycle';
import { useRouteContext } from '../../../frontend/site/hooks/use-route-context';
import { HrefLink } from '@/frontend/shared/utility/href-link';
import {
  HooksTableGridRenderer,
  HooksTablePersonalNotesModalButton,
  HooksTableTopLevelFieldsModalButton,
} from './hooks-table-grid-renderer';
import { ContributionEditorStateAlerts } from './contribution-editor-state-alerts';
import { ContributionSuccessModal } from './contribution-success-modal';
import { getBlockedReason } from './tabular-project-custom-editor-utils';

function HooksTableCustomEditorContent({ canvasId, canvas }: { canvasId: number; canvas: unknown }) {
  const lifecycle = useCaptureModelContributionLifecycle();
  const table = useCaptureModelEditorApi({ tableProperty: 'rows' });
  const currentRevisionId = Revisions.useStoreState(state => state.currentRevisionId);
  const currentRevisionStatus = Revisions.useStoreState(state => state.currentRevision?.revision.status);
  const deselectRevision = Revisions.useStoreActions(actions => actions.deselectRevision);
  const [successModalState, setSuccessModalState] = useState<'saved' | 'submitted' | null>(null);

  const isPersisting = lifecycle.phase === 'saving-draft' || lifecycle.phase === 'submitting';
  const isLoading = lifecycle.phase === 'loading' || lifecycle.phase === 'preparing';
  const isBlocked = lifecycle.phase === 'blocked';
  const isSubmittedRevision = currentRevisionStatus === 'submitted';
  const isEditingDisabled = isBlocked || isPersisting || isSubmittedRevision;
  const canStartAnotherSubmission =
    !lifecycle.preventFurtherSubmission && lifecycle.canContribute && lifecycle.canUserSubmit;

  async function onSaveForLater() {
    if (isSubmittedRevision) {
      return;
    }

    try {
      await lifecycle.saveForLater();
      setSuccessModalState('saved');
    } catch {
      // error
    }
  }

  async function onSubmit() {
    if (isSubmittedRevision) {
      return;
    }

    try {
      await lifecycle.submit();
      setSuccessModalState('submitted');
    } catch {
      // error
    }
  }

  function onContinueAfterSuccess() {
    if (successModalState !== 'submitted' || !canStartAnotherSubmission) {
      return;
    }

    if (currentRevisionId) {
      deselectRevision({ revisionId: currentRevisionId });
    }

    void lifecycle.ensureRevision().catch(() => {
      // no-op
    });
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
            onRetry={() => lifecycle.prepare()}
            onEnsureRevision={() => lifecycle.ensureRevision()}
          />

          {!isLoading && lifecycle.phase !== 'error' && table.status === 'ready' ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => table.addRow()} disabled={isEditingDisabled} title="Add a new table row">
                  Add row
                </Button>
                <HooksTableTopLevelFieldsModalButton table={table} mode="write" disabled={isEditingDisabled} />
                <HooksTablePersonalNotesModalButton disabled={isEditingDisabled} />
              </div>

              <HooksTableGridRenderer table={table} mode="write" disabled={isEditingDisabled} />

              <ButtonRow>
                <Button onClick={onSaveForLater} disabled={isEditingDisabled}>
                  {isPersisting && lifecycle.phase === 'saving-draft' ? 'Saving...' : 'Save for later'}
                </Button>
                <Button $primary onClick={onSubmit} disabled={isEditingDisabled}>
                  {isPersisting && lifecycle.phase === 'submitting' ? 'Submitting...' : 'Submit'}
                </Button>
              </ButtonRow>
            </>
          ) : null}

          {lifecycle.nextCanvas.hasNext && lifecycle.nextCanvas.next ? (
            <ButtonRow>
              <HrefLink href={lifecycle.nextCanvas.next.href}>Next image</HrefLink>
            </ButtonRow>
          ) : null}

          {table.errors.length ? <pre className="whitespace-pre-wrap">{table.errors.join('\n')}</pre> : null}
          {lifecycle.lastError && lifecycle.lastErrorStage === 'save' && lifecycle.phase !== 'error' ? (
            <div className="rounded border border-red-200 bg-red-50 p-2 text-sm">
              <p>Could not save your latest changes. Please try again.</p>
              <pre className="whitespace-pre-wrap">{lifecycle.lastError.message}</pre>
            </div>
          ) : null}
          {isSubmittedRevision ? (
            <div className="rounded border border-blue-200 bg-blue-50 p-2 text-sm">
              This submission has already been submitted and cannot be edited.
            </div>
          ) : null}
        </div>
      </div>
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
