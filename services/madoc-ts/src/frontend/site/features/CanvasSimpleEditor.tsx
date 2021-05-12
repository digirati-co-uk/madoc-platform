import { Runtime } from '@atlas-viewer/atlas';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonIcon, ButtonRow } from '../../shared/atoms/Button';
import { EmptyState } from '../../shared/atoms/EmptyState';
import { SmallToast } from '../../shared/atoms/SmallToast';
import { TickIcon } from '../../shared/atoms/TickIcon';
import { BackToChoicesButton } from '../../shared/caputre-models/new/components/BackToChoicesButton';
import { EditorSlots } from '../../shared/caputre-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../shared/caputre-models/new/components/RevisionProviderWithFeatures';
import { SimpleSaveButton } from '../../shared/caputre-models/new/components/SimpleSaveButton';
import { EditorContentViewer } from '../../shared/caputre-models/new/EditorContent';
import { CanvasVaultContext } from '../../shared/components/CanvasVaultContext';
import { useApi } from '../../shared/hooks/use-api';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { useLoadedCaptureModel } from '../../shared/hooks/use-loaded-capture-model';
import { isEditingAnotherUsersRevision } from '../../shared/utility/is-editing-another-users-revision';
import { useCanvasModel } from '../hooks/use-canvas-model';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useContributionMode } from '../hooks/use-contribution-mode';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasModelUserStatus } from './CanvasModelUserStatus';
import { CanvasViewer } from './CanvasViewer';
import { useSiteConfiguration } from './SiteConfigurationContext';
import { TranscriberModeWorkflowBar } from './TranscriberModeWorkflowBar';

export const CanvasSimpleEditor: React.FC<{ revision: string; isComplete?: boolean }> = ({ revision }) => {
  const { t } = useTranslation();
  const { projectId, canvasId } = useRouteContext();
  const { data: projectModel } = useCanvasModel();
  const [{ captureModel }] = useLoadedCaptureModel(projectModel?.model?.id, undefined, canvasId);
  const { updateClaim, allTasksDone, markedAsUnusable } = useCanvasUserTasks();
  const user = useCurrentUser(true);
  const config = useSiteConfiguration();
  const mode = useContributionMode();
  const isVertical = config.project.defaultEditorOrientation === 'vertical';
  const api = useApi();
  const runtime = useRef<Runtime>();
  const gridRef = useRef<any>();
  const [height, setHeight] = useState(600);
  const [showPanWarning, setShowPanWarning] = useState(false);

  useLayoutEffect(() => {
    if (gridRef.current) {
      const bounds = gridRef.current.getBoundingClientRect();
      if (bounds.height) {
        setHeight(bounds.height);
      }
    }
  }, []);

  const allowMultiple = !config.project.modelPageOptions?.preventMultipleUserSubmissionsPerResource;
  const preventFurtherSubmission = !allowMultiple && allTasksDone;

  const isEditing = isEditingAnotherUsersRevision(captureModel, revision, user.user);

  const onPanInSketchMode = useCallback(() => {
    setShowPanWarning(true);
    setTimeout(() => {
      setShowPanWarning(false);
    }, 3000);
  }, []);

  const goHome = () => {
    if (runtime.current) {
      runtime.current.world.goHome();
    }
  };

  const zoomIn = () => {
    if (runtime.current) {
      runtime.current.world.zoomIn();
    }
  };

  const zoomOut = () => {
    if (runtime.current) {
      runtime.current.world.zoomOut();
    }
  };

  const canContribute =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

  if (api.getIsServer() || !canvasId || !projectId) {
    return null;
  }

  return (
    <CanvasVaultContext>
      <RevisionProviderWithFeatures
        key={revision}
        revision={revision}
        captureModel={captureModel}
        slotConfig={{
          editor: { allowEditing: !preventFurtherSubmission, deselectRevisionAfterSaving: true },
          components: { SubmitButton: isEditing || mode === 'transcription' ? SimpleSaveButton : undefined },
        }}
      >
        <TranscriberModeWorkflowBar />

        <CanvasViewer>
          <div
            ref={gridRef}
            style={{
              display: 'flex',
              flexDirection: isVertical ? 'column' : 'row',
              width: '100%',
              maxHeight: '100%',
              height: '100%',
            }}
          >
            <div
              style={{
                width: isVertical ? '100%' : 'auto',
                flex: '1 1 0px',
                height: '100%',
                minWidth: 0,
                position: 'relative',
              }}
            >
              <EditorContentViewer
                height={height}
                canvasId={canvasId}
                onCreated={rt => {
                  return ((runtime as any).current = rt.runtime);
                }}
                onPanInSketchMode={onPanInSketchMode}
              />

              <ButtonRow style={{ position: 'absolute', top: 0, left: 10, zIndex: 20 }}>
                <Button onClick={goHome}>{t('atlas__zoom_home', { defaultValue: 'Home' })}</Button>
                <Button onClick={zoomOut}>{t('atlas__zoom_out', { defaultValue: '-' })}</Button>
                <Button onClick={zoomIn}>{t('atlas__zoom_in', { defaultValue: '+' })}</Button>
              </ButtonRow>

              <div
                style={{
                  position: 'absolute',
                  bottom: '50%',
                  zIndex: 20,
                  textAlign: 'center',
                  left: 0,
                  right: 0,
                  pointerEvents: 'none',
                }}
              >
                <SmallToast $active={showPanWarning}>{t('Hold space to pan and zoom')}</SmallToast>
              </div>
            </div>

            <div
              style={{
                width: isVertical ? '100%' : '420px',
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CanvasModelUserStatus isEditing={isEditing} />
              {preventFurtherSubmission ? (
                <>
                  <EmptyState style={{ fontSize: '1.25em' }} $box>
                    <ButtonIcon>
                      <TickIcon />
                    </ButtonIcon>
                    <strong>{t('Task is complete!')}</strong>
                  </EmptyState>
                  <EmptyState>
                    {markedAsUnusable
                      ? t('You have marked this as unusable')
                      : t(
                          'Thank you for your submission. You can view your contribution in the left sidebar. You can continue working on another canvas'
                        )}
                  </EmptyState>
                </>
              ) : canContribute && captureModel ? (
                <>
                  <BackToChoicesButton />

                  <div style={{ overflowY: 'auto', padding: '1em 1em 0 1em', fontSize: '13px' }}>
                    <EditorSlots.TopLevelEditor />
                  </div>

                  <EditorSlots.SubmitButton afterSave={isEditing ? undefined : updateClaim} />
                </>
              ) : (
                <EmptyState>{t('Loading your model')}</EmptyState>
              )}
            </div>
          </div>
        </CanvasViewer>
      </RevisionProviderWithFeatures>
    </CanvasVaultContext>
  );
};
