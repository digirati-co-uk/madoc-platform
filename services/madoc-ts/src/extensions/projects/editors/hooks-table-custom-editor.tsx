import React, { useMemo } from 'react';
import {
  CanvasViewerGrid,
  CanvasViewerGridContent,
  CanvasViewerGridSidebar,
} from '../../../frontend/shared/atoms/CanvasViewerGrid';
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

function getBlockedReason(options: {
  hasExpired: boolean;
  canContribute: boolean;
  canUserSubmit: boolean;
  preventFurtherSubmission: boolean;
  markedAsUnusable: boolean;
}) {
  if (options.hasExpired) {
    return 'This contribution has expired and cannot be edited.';
  }

  if (options.markedAsUnusable) {
    return 'This resource has been marked as unusable.';
  }

  if (options.preventFurtherSubmission) {
    return 'Further submission is disabled for this task.';
  }

  if (!options.canContribute || !options.canUserSubmit) {
    return 'Contribution is currently unavailable for this task.';
  }

  return 'Contribution is currently blocked.';
}

const HooksTableCustomEditorContent: React.FC<{ canvasId: number; canvas: any }> = ({ canvasId, canvas }) => {
  const lifecycle = useCaptureModelContributionLifecycle();
  const table = useCaptureModelEditorApi({ tableProperty: 'rows' });

  const isPersisting = lifecycle.phase === 'saving-draft' || lifecycle.phase === 'submitting';
  const isLoading = lifecycle.phase === 'loading' || lifecycle.phase === 'preparing';
  const isBlocked = lifecycle.phase === 'blocked';

  const topLevelKeys = useMemo(() => Object.keys(table.topLevelFields), [table.topLevelFields]);

  async function onSaveForLater() {
    try {
      await lifecycle.saveForLater();
    } catch {
      // Error state is surfaced from lifecycle.lastError.
    }
  }

  async function onSubmit() {
    try {
      await lifecycle.submit();
    } catch {
      // Error state is surfaced from lifecycle.lastError.
    }
  }

  return (
    <CanvasViewerGrid>
      <CanvasViewerGridContent>
        <EditorContentViewer canvasId={canvasId} canvas={canvas} />
      </CanvasViewerGridContent>
      <CanvasViewerGridSidebar>
        <div className="flex flex-col gap-4 p-4">
          <div>
            <strong>Hooks table editor</strong>
          </div>

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

          {isBlocked ? (
            <div>{getBlockedReason(lifecycle)}</div>
          ) : null}

          {!isLoading && lifecycle.phase !== 'error' && table.status !== 'ready' ? (
            <div>
              <p>Table configuration is unavailable.</p>
              {table.errors.length ? <pre className="whitespace-pre-wrap">{table.errors.join('\n')}</pre> : null}
              {lifecycle.needsRevisionSelection ? (
                <Button onClick={() => lifecycle.ensureRevision()}>Try selecting revision</Button>
              ) : null}
            </div>
          ) : null}

          {!isLoading && lifecycle.phase !== 'error' && table.status === 'ready' ? (
            <>
              <ButtonRow>
                <Button
                  onClick={() => table.addRow()}
                  disabled={isBlocked || isPersisting}
                  title="Add a new table row"
                >
                  Add row
                </Button>
              </ButtonRow>

              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    {table.columns.map(column => (
                      <th key={column.key} className="border border-gray-300 p-2 align-top">
                        {column.label}
                      </th>
                    ))}
                    <th className="border border-gray-300 p-2 align-top">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map(row => (
                    <tr key={row.entityId}>
                      {table.columns.map(column => {
                        const cell = row.getCell(column.key);
                        return (
                          <td key={column.key} className="border border-gray-300 p-2 align-top">
                            <input
                              className="min-h-9 w-full rounded border border-gray-300 px-1.5 py-1"
                              value={String(cell?.value ?? '')}
                              disabled={isBlocked || isPersisting}
                              onChange={event => row.setCell(column.key, event.target.value)}
                            />
                          </td>
                        );
                      })}
                      <td className="border border-gray-300 p-2 align-top">
                        <Button
                          onClick={() => table.removeRow(row.rowIndex)}
                          disabled={isBlocked || isPersisting || table.rowCount < 2}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {topLevelKeys.length ? (
                <div className="flex flex-col gap-2">
                  <strong>Top-level fields</strong>
                  {topLevelKeys.map(property => (
                    <div key={property} className="flex flex-col gap-1">
                      <label htmlFor={`top-level-${property}-0`}>
                        <strong>{property}</strong>
                      </label>
                      {(table.topLevelFields[property] || []).map((field, index) => (
                        <textarea
                          id={`top-level-${property}-${index}`}
                          key={`${property}-${field.fieldId || index}`}
                          className="min-h-16 w-full rounded border border-gray-300 p-1.5"
                          value={String(field.value ?? '')}
                          disabled={isBlocked || isPersisting}
                          onChange={event => field.setValue(event.target.value)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : null}

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
      </CanvasViewerGridSidebar>
    </CanvasViewerGrid>
  );
};

export const HooksTableCustomEditor: React.FC = () => {
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
};
