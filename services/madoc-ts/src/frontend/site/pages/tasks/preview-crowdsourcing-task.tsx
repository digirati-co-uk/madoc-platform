import { Runtime } from '@atlas-viewer/atlas';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { ThemeProvider } from 'styled-components';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { defaultTheme } from '../../../shared/capture-models/editor/themes';
import { DirectEditButton } from '../../../shared/capture-models/new/components/DirectEditButton';
import { EditorSlots } from '../../../shared/capture-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../../shared/capture-models/new/components/RevisionProviderWithFeatures';
import { EditorContentViewer } from '../../../shared/capture-models/new/EditorContent';
import { useBrowserLayoutEffect } from '../../../shared/hooks/use-browser-layout-effect';
import { HomeIcon } from '../../../shared/icons/HomeIcon';
import { MinusIcon } from '../../../shared/icons/MinusIcon';
import { PlusIcon } from '../../../shared/icons/PlusIcon';

import {
  EditorToolbarButton,
  EditorToolbarContainer,
  EditorToolbarIcon,
  EditorToolbarLabel,
  EditorToolbarSpacer,
  EditorToolbarTitle,
} from '../../../shared/navigation/EditorToolbar';
import { useApiTask } from '../../../shared/hooks/use-api-task';
import { ArrowBackIcon } from '../../../shared/icons/ArrowBackIcon';
import { EditIcon } from '../../../shared/icons/EditIcon';
import { FullScreenExitIcon } from '../../../shared/icons/FullScreenExitIcon';
import { FullScreenEnterIcon } from '../../../shared/icons/FullScreenEnterIcon';
import { MaximiseWindow } from '../../../shared/layout/MaximiseWindow';
import { PreviewIcon } from '../../../shared/icons/PreviewIcon';
import { useLoadedCaptureModel } from '../../../shared/hooks/use-loaded-capture-model';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import {
  CanvasViewerButton,
  CanvasViewerControls,
  CanvasViewerEditorStyleReset,
  CanvasViewerGrid,
  CanvasViewerGridContent,
  CanvasViewerGridSidebar,
} from '../../../shared/atoms/CanvasViewerGrid';
import { useCrowdsourcingTaskDetails } from '../../hooks/use-crowdsourcing-task-details';
import { useReviewConfiguration } from '../../hooks/use-review-configuration';
import { RequestChanges } from './actions/request-changes';
import { ApproveSubmission } from './actions/approve-submission';
import { RejectSubmission } from './actions/reject-submission';
import { StartMerge } from './actions/start-merge';
import { EmptyState } from '../../../shared/layout/EmptyState';

const PreviewCrowdsourcingTask: React.FC<{
  task: CrowdsourcingTask & { id: string };
  reviewTaskId: string;
  allRevisionIds: string[];
  allTaskIds: string[];
  lockedTasks?: string[];
  allTasks: Array<CrowdsourcingTask>;
  goBack: (props?: { refresh?: boolean; revisionId?: string }) => void | Promise<void>;
}> = props => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: taskData } = useApiTask<CrowdsourcingTask>(props.task.id);
  const { captureModel, canvas, project, modelStatus } = useCrowdsourcingTaskDetails(props.task);
  const { t } = useTranslation();
  const gridRef = useRef<any>(undefined);
  const runtime = useRef<Runtime>(undefined);
  const config = useReviewConfiguration();
  const [height, setHeight] = useState(600);
  const isLocked = props.lockedTasks && props.lockedTasks.indexOf(props.task.id) !== -1;
  const isDone = taskData?.status === 3;

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

  const resize = useCallback(() => {
    if (gridRef.current) {
      const bounds = gridRef.current.getBoundingClientRect();
      if (bounds.height) {
        setHeight(bounds.height);
      }
    }
  }, []);

  useBrowserLayoutEffect(() => {
    resize();
    if (window) {
      window.addEventListener('resize', resize);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }
  }, [resize, captureModel]);

  return (
    <ThemeProvider theme={defaultTheme}>
      {isLocked ? <WarningMessage>This task is locked, there is a merge in progress</WarningMessage> : null}
      <MaximiseWindow onChange={resize}>
        {({ toggle, isOpen }) =>
          captureModel ? (
            <RevisionProviderWithFeatures
              captureModel={captureModel}
              key={taskData?.state?.revisionId}
              revision={taskData?.state?.revisionId}
              features={{
                autosave: false,
                autoSelectingRevision: true,
                revisionEditMode: false,
                directEdit: true,
              }}
              slotConfig={{
                editor: {
                  allowEditing: isEditing,
                  deselectRevisionAfterSaving: false,
                  saveOnNavigate: false,
                },
                components: {
                  SubmitButton: DirectEditButton,
                },
              }}
            >
              <EditorToolbarContainer>
                <EditorToolbarButton onClick={() => props.goBack()}>
                  <EditorToolbarIcon>
                    <ArrowBackIcon />
                  </EditorToolbarIcon>
                </EditorToolbarButton>
                <EditorToolbarTitle>{taskData?.assignee?.name}</EditorToolbarTitle>

                <EditorToolbarSpacer />

                <EditorToolbarButton onClick={() => setIsEditing(r => !r)} disabled={isLocked || isDone}>
                  <EditorToolbarIcon>{isEditing ? <PreviewIcon /> : <EditIcon />}</EditorToolbarIcon>
                  <EditorToolbarLabel>{isEditing ? 'preview submission' : 'edit submission'}</EditorToolbarLabel>
                </EditorToolbarButton>

                {isLocked || isDone ? null : (
                  <>
                    <RejectSubmission userTaskId={props.task.id} onReject={() => props.goBack({ refresh: true })} />

                    <RequestChanges
                      userTaskId={props.task.id}
                      changesRequested={props.task.state?.changesRequested}
                      onRequest={() => props.goBack({ refresh: true })}
                    />

                    {config.allowMerging ? (
                      <StartMerge
                        allTasks={props.allTasks as any}
                        reviewTaskId={props.reviewTaskId}
                        userTask={props.task}
                        onStartMerge={(revId: string) => props.goBack({ refresh: true, revisionId: revId })}
                      />
                    ) : null}

                    <ApproveSubmission
                      project={project}
                      userTaskId={props.task.id}
                      allRevisionIds={props.allRevisionIds}
                      allUserTaskIds={props.allTaskIds}
                      onApprove={() => props.goBack({ refresh: true })}
                      reviewTaskId={props.reviewTaskId}
                    />
                  </>
                )}

                <EditorToolbarButton onClick={toggle}>
                  <EditorToolbarIcon>{isOpen ? <FullScreenExitIcon /> : <FullScreenEnterIcon />}</EditorToolbarIcon>
                </EditorToolbarButton>
              </EditorToolbarContainer>

              <CanvasViewerGrid ref={gridRef}>
                <CanvasViewerGridContent>
                  {canvas ? (
                    <EditorContentViewer
                      height={height}
                      canvasId={canvas.id}
                      onCreated={rt => {
                        return ((runtime as any).current = rt.runtime);
                      }}
                    />
                  ) : null}

                  <CanvasViewerControls>
                    <CanvasViewerButton onClick={goHome}>
                      <HomeIcon title={t('atlas__zoom_home', { defaultValue: 'Home' })} />
                    </CanvasViewerButton>
                    <CanvasViewerButton onClick={zoomOut}>
                      <MinusIcon title={t('atlas__zoom_out', { defaultValue: 'Zoom out' })} />
                    </CanvasViewerButton>
                    <CanvasViewerButton onClick={zoomIn}>
                      <PlusIcon title={t('atlas__zoom_in', { defaultValue: 'Zoom in' })} />
                    </CanvasViewerButton>
                  </CanvasViewerControls>
                </CanvasViewerGridContent>
                <CanvasViewerGridSidebar>
                  <CanvasViewerEditorStyleReset>
                    <EditorSlots.TopLevelEditor />
                  </CanvasViewerEditorStyleReset>

                  <EditorSlots.SubmitButton captureModel={captureModel} />
                </CanvasViewerGridSidebar>
              </CanvasViewerGrid>
            </RevisionProviderWithFeatures>
          ) : (
            <>
              <EditorToolbarContainer>
                <EditorToolbarButton onClick={() => props.goBack()}>
                  <EditorToolbarIcon>
                    <ArrowBackIcon />
                  </EditorToolbarIcon>
                </EditorToolbarButton>
                <EditorToolbarTitle>{taskData?.assignee?.name}</EditorToolbarTitle>
              </EditorToolbarContainer>

              {modelStatus === 'error' ? (
                <ErrorMessage $banner>Model not found</ErrorMessage>
              ) : (
                <EmptyState>loading...</EmptyState>
              )}
            </>
          )
        }
      </MaximiseWindow>
    </ThemeProvider>
  );
};

export default PreviewCrowdsourcingTask;
