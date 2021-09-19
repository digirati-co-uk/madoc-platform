import React, { useState } from 'react';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { ThemeProvider } from 'styled-components';
import { defaultTheme, Revisions } from '@capture-models/editor';
import { ViewContent } from '../../../shared/components/ViewContent';
import { RevisionTopLevel } from '../../../shared/caputre-models/RevisionTopLevel';
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
import { RequestChanges } from './actions/request-changes';
import { ApproveSubmission } from './actions/approve-submission';
import { RejectSubmission } from './actions/reject-submission';
import { StartMerge } from './actions/start-merge';

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

  const modelId = taskData?.parameters[0] || undefined;

  const [{ captureModel, canvas }] = useLoadedCaptureModel(modelId);

  const isLocked = props.lockedTasks && props.lockedTasks.indexOf(props.task.id) !== -1;
  const isDone = taskData?.status === 3;

  return (
    <ThemeProvider theme={defaultTheme}>
      {isLocked ? <WarningMessage>This task is locked, there is a merge in progress</WarningMessage> : null}
      <MaximiseWindow>
        {({ toggle, isOpen }) =>
          captureModel ? (
            <Revisions.Provider captureModel={captureModel} initialRevision={taskData?.state.revisionId}>
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

                    <StartMerge
                      allTasks={props.allTasks as any}
                      reviewTaskId={props.reviewTaskId}
                      userTask={props.task}
                      onStartMerge={(revId: string) => props.goBack({ refresh: true, revisionId: revId })}
                    />

                    <ApproveSubmission
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
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ width: '67%' }}>
                  {canvas ? <ViewContent target={captureModel.target as any} canvas={canvas} /> : null}
                </div>
                <div style={{ width: '33%', padding: '1em' }}>
                  <RevisionTopLevel
                    allowEdits={false}
                    allowNavigation={false}
                    onSaveRevision={async rev => {
                      // no-op
                    }}
                    readOnly={!isEditing}
                  />
                </div>
              </div>
            </Revisions.Provider>
          ) : (
            'loading...'
          )
        }
      </MaximiseWindow>
    </ThemeProvider>
  );
};

export default PreviewCrowdsourcingTask;
