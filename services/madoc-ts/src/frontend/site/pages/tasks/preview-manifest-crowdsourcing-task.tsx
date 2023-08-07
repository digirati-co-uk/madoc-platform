import React, { useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { MetadataEmptyState } from '../../../shared/atoms/MetadataConfiguration';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import { defaultTheme } from '../../../shared/capture-models/editor/themes';
import { DirectEditButton } from '../../../shared/capture-models/new/components/DirectEditButton';
import { EditorSlots } from '../../../shared/capture-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../../shared/capture-models/new/components/RevisionProviderWithFeatures';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { useApiTask } from '../../../shared/hooks/use-api-task';
import { ArrowBackIcon } from '../../../shared/icons/ArrowBackIcon';
import { EditIcon } from '../../../shared/icons/EditIcon';
import { FullScreenEnterIcon } from '../../../shared/icons/FullScreenEnterIcon';
import { FullScreenExitIcon } from '../../../shared/icons/FullScreenExitIcon';
import { PreviewIcon } from '../../../shared/icons/PreviewIcon';
import { EmptyState } from '../../../shared/layout/EmptyState';
import { MaximiseWindow } from '../../../shared/layout/MaximiseWindow';
import {
  EditorToolbarButton,
  EditorToolbarContainer,
  EditorToolbarIcon,
  EditorToolbarLabel,
  EditorToolbarSpacer,
  EditorToolbarTitle,
} from '../../../shared/navigation/EditorToolbar';
import {
  CanvasViewerEditorStyleReset,
  CanvasViewerGrid,
  CanvasViewerGridContent,
  CanvasViewerGridSidebar,
} from '../../../shared/atoms/CanvasViewerGrid';
import { useCrowdsourcingTaskDetails } from '../../hooks/use-crowdsourcing-task-details';
import { ApproveSubmission } from './actions/approve-submission';
import { RejectSubmission } from './actions/reject-submission';
import { RequestChanges } from './actions/request-changes';

export function PreviewManifestCrowdsourcingTask(props: {
  task: CrowdsourcingTask & { id: string };
  reviewTaskId: string;
  allRevisionIds: string[];
  allTaskIds: string[];
  lockedTasks?: string[];
  allTasks: Array<CrowdsourcingTask>;
  goBack: (p?: { refresh?: boolean; revisionId?: string }) => void | Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: taskData } = useApiTask<CrowdsourcingTask>(props.task.id);
  const gridRef = useRef<any>();
  const { captureModel, project, modelStatus } = useCrowdsourcingTaskDetails(props.task);
  const isLocked = props.lockedTasks && props.lockedTasks.indexOf(props.task.id) !== -1;
  const isDone = taskData?.status === 3;

  return (
    <ThemeProvider theme={defaultTheme}>
      {isLocked ? <WarningMessage>This task is locked, there is a merge in progress</WarningMessage> : null}
      <MaximiseWindow>
        {({ toggle, isOpen }) =>
          captureModel ? (
            <RevisionProviderWithFeatures
              captureModel={captureModel}
              key={taskData?.state.revisionId}
              revision={taskData?.state.revisionId}
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
                  <MetadataEmptyState>No preview</MetadataEmptyState>
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
}
