import React, { Suspense, useCallback, useState } from 'react';
import { Heading3 } from '../../../shared/atoms/Heading3';
import { CrowdsourcingTask } from '../../../../types/tasks/crowdsourcing-task';
import { useQuery } from 'react-query';
import { useApi } from '../../../shared/hooks/use-api';
import { ThemeProvider } from 'styled-components';
import { defaultTheme, Revisions } from '@capture-models/editor';
import { ViewContent } from '../../../shared/components/ViewContent';
import { CanvasFull } from '../../../../types/schemas/canvas-full';
import { CaptureModel, RevisionRequest } from '@capture-models/types';
import { RevisionTopLevel } from '../../../shared/caputre-models/RevisionTopLevel';
import {
  EditorToolbarButton,
  EditorToolbarContainer,
  EditorToolbarIcon,
  EditorToolbarLabel,
  EditorToolbarSpacer,
  EditorToolbarTitle,
} from '../../../shared/atoms/EditorToolbar';
import { ArrowBackIcon } from '../../../shared/icons/ArrowBackIcon';
import { EditIcon } from '../../../shared/icons/EditIcon';
import { ModalButton } from '../../../shared/components/Modal';
import { Button, ButtonRow } from '../../../shared/atoms/Button';
import { DeleteForeverIcon } from '../../../shared/icons/DeleteForeverIcon';
import { TextField } from '@capture-models/editor/lib/input-types/TextField/TextField';
import { ReadMoreIcon } from '../../../shared/icons/ReadMoreIcon';
import { CallMergeIcon } from '../../../shared/icons/CallMergeIcon';
import { GradingIcon } from '../../../shared/icons/GradingIcon';
import { FullScreenExitIcon } from '../../../shared/icons/FullScreenExitIcon';
import { FullScreenEnterIcon } from '../../../shared/icons/FullScreenEnterIcon';
import { MaximiseWindow } from '../../../shared/atoms/MaximiseWindow';
import { PreviewIcon } from '../../../shared/icons/PreviewIcon';

function useLoadedCaptureModel(modelId?: string): { canvas?: CanvasFull; captureModel?: CaptureModel; target?: any } {
  const api = useApi();
  const { data } = useQuery(
    ['preview-crowdsourcing-task', { id: modelId }],
    async () => {
      if (!modelId) {
        return;
      }
      const captureModel = await api.getCaptureModel(modelId);
      if (!captureModel.target || !captureModel.target[0]) {
        return;
      }
      const target = captureModel.target.map(item => api.resolveUrn(item.id));
      const primaryTarget = captureModel ? target.find((t: any) => t.type.toLowerCase() === 'canvas') : undefined;

      if (!primaryTarget) {
        return;
      }

      const { canvas } = await api.getSiteCanvas(primaryTarget.id);

      return { canvas, target, captureModel };
    },
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchIntervalInBackground: false,
    }
  );

  return data || ({} as any);
}

const RequestChanges: React.FC<{ userTaskId: string; changesRequested?: string; onRequest: () => void }> = ({
  changesRequested,
  userTaskId,
  onRequest,
}) => {
  const api = useApi();
  const [requestMessage, setRequestMessage] = useState(changesRequested || '');
  const [isLoading, setIsLoading] = useState(false);
  const { currentRevision } = Revisions.useStoreState(state => {
    return {
      currentRevision: state.currentRevision,
    };
  });
  const deselectRevision = Revisions.useStoreActions(a => a.deselectRevision);

  const requestChangesApiCall = useCallback(() => {
    if (currentRevision) {
      setIsLoading(true);
      api
        .reviewRequestChanges({
          message: requestMessage,
          revisionRequest: currentRevision,
          userTaskId,
        })
        .then(() => {
          deselectRevision({ revisionId: currentRevision.revision.id });
          setIsLoading(false);
          onRequest();
        });
    }
  }, [api, currentRevision, deselectRevision, onRequest, requestMessage, userTaskId]);

  if (currentRevision?.revision.approved) {
    return null;
  }

  return (
    <EditorToolbarButton
      disabled={isLoading}
      as={ModalButton}
      button={true}
      autoHeight={true}
      title="Request changes"
      render={() => (
        <Suspense fallback={<div />}>
          <label htmlFor="message">Write a message to the contributor</label>
          <TextField
            id="message"
            type="text-field"
            value={requestMessage}
            label="Write message to the contributor"
            updateValue={setRequestMessage}
            multiline={true}
          />
          <p>Once requested the task will be assigned back to user</p>
        </Suspense>
      )}
      renderFooter={({ close }: any) => (
        <Button
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            close();
            requestChangesApiCall();
          }}
        >
          Request changes
        </Button>
      )}
    >
      <EditorToolbarIcon>
        <ReadMoreIcon />
      </EditorToolbarIcon>
      <EditorToolbarLabel>request changes</EditorToolbarLabel>
    </EditorToolbarButton>
  );
};

const ApproveSubmission: React.FC<{
  onApprove: () => void;
  userTaskId: string;
  allUserTaskIds: string[];
  allRevisionIds: string[];
  reviewTaskId: string;
}> = ({ userTaskId, allUserTaskIds, allRevisionIds, reviewTaskId, onApprove }) => {
  const { acceptedRevision } = Revisions.useStoreState(state => {
    return {
      acceptedRevision: state.currentRevision,
    };
  });
  const [loading, setIsLoading] = useState(false);
  const api = useApi();
  const revisionIdsToRemove = allRevisionIds.filter(id => id && id !== acceptedRevision?.revision.id);
  const userTaskIdsToRemove = allUserTaskIds.filter(id => id && id !== userTaskId);
  const approveAndRemoveApiCall = useCallback(() => {
    if (acceptedRevision) {
      setIsLoading(true);
      api
        .reviewApproveAndRemoveSubmission({
          userTaskIds: userTaskIdsToRemove,
          reviewTaskId,
          acceptedRevision,
          revisionIdsToRemove,
        })
        .then(() => {
          setIsLoading(false);
          onApprove();
        });
    }
  }, [acceptedRevision, api, onApprove, reviewTaskId, revisionIdsToRemove, userTaskIdsToRemove]);

  const approveApiCall = useCallback(() => {
    if (acceptedRevision) {
      setIsLoading(true);
      api
        .reviewApproveSubmission({
          revisionRequest: acceptedRevision,
          userTaskId,
        })
        .then(() => {
          setIsLoading(false);
          onApprove();
        });
    }
  }, [acceptedRevision, api, onApprove, userTaskId]);

  if (acceptedRevision?.revision.status === 'accepted') {
    return null;
  }

  return (
    <EditorToolbarButton
      as={ModalButton}
      button={true}
      disabled={loading}
      autoHeight={true}
      title="Approve submission"
      render={() => (
        <div>
          <ul>
            <li>
              <strong>Approve</strong> - The submission will be approved and all other submission will remain
            </li>
            <li>
              <strong>Approve and remove remaining</strong> - The submission will be approved and all other submission
              will be removed. The users who created all of the submissions will see their submission approved. This can
              be good if merging multiple revisions.
            </li>
          </ul>
        </div>
      )}
      renderFooter={({ close }: any) => (
        <ButtonRow style={{ margin: '0 0 0 auto' }}>
          <Button
            onClick={() => {
              approveApiCall();
              close();
            }}
          >
            Approve
          </Button>
          <Button
            onClick={() => {
              approveAndRemoveApiCall();
              close();
            }}
          >
            Approve and remove remaining
          </Button>
        </ButtonRow>
      )}
    >
      <EditorToolbarIcon>
        <GradingIcon />
      </EditorToolbarIcon>
      <EditorToolbarLabel>approve</EditorToolbarLabel>
    </EditorToolbarButton>
  );
};

const RejectSubmission: React.FC<{ onReject: () => void; userTaskId: string }> = ({ onReject, userTaskId }) => {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const { currentRevision } = Revisions.useStoreState(state => {
    return {
      currentRevision: state.currentRevision,
    };
  });
  const deselectRevision = Revisions.useStoreActions(a => a.deselectRevision);

  const rejectApiCall = useCallback(() => {
    if (currentRevision) {
      setIsLoading(true);
      api
        .reviewRejectSubmission({
          revisionRequest: currentRevision,
          userTaskId,
        })
        .then(() => {
          deselectRevision({ revisionId: currentRevision.revision.id });
          setIsLoading(false);
          onReject();
        });
    }
  }, [api, currentRevision, deselectRevision, onReject, userTaskId]);

  if (!currentRevision || currentRevision.revision.approved) {
    return null;
  }

  return (
    <EditorToolbarButton
      as={ModalButton}
      disabled={isLoading}
      button={true}
      autoHeight={true}
      title="Reject submission"
      render={() => (
        <div>
          <strong>Are you sure you want to delete this revision and mark the task as rejected?</strong>
          <ul>
            <li>The user will be notified that the revision has been rejected</li>
            <li>You will no longer be able to see the content in the revision</li>
          </ul>
        </div>
      )}
      renderFooter={({ close }: any) => (
        <Button
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            close();
            rejectApiCall();
          }}
        >
          Reject changes
        </Button>
      )}
    >
      <EditorToolbarIcon>
        <DeleteForeverIcon />
      </EditorToolbarIcon>
      <EditorToolbarLabel>reject submission</EditorToolbarLabel>
    </EditorToolbarButton>
  );
};

const PreviewCrowdsourcingTask: React.FC<{
  task: CrowdsourcingTask & { id: string };
  reviewTaskId: string;
  allRevisionIds: string[];
  allTaskIds: string[];
  goBack: (props?: { refresh?: boolean }) => void | Promise<void>;
}> = props => {
  const [isEditing, setIsEditing] = useState(false);
  const api = useApi();
  const { data: taskData } = useQuery(['task', { id: props.task.id }], async () => {
    if (!props.task.id) {
      return;
    }
    return await api.getTaskById<CrowdsourcingTask>(props.task.id);
  });

  const modelId = taskData?.parameters[0];

  const { captureModel, canvas } = useLoadedCaptureModel(modelId);

  return (
    <ThemeProvider theme={defaultTheme}>
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

                <EditorToolbarButton onClick={() => setIsEditing(r => !r)}>
                  <EditorToolbarIcon>{isEditing ? <PreviewIcon /> : <EditIcon />}</EditorToolbarIcon>
                  <EditorToolbarLabel>{isEditing ? 'preview submission' : 'edit submission'}</EditorToolbarLabel>
                </EditorToolbarButton>

                <RejectSubmission userTaskId={props.task.id} onReject={() => props.goBack({ refresh: true })} />

                <RequestChanges
                  userTaskId={props.task.id}
                  changesRequested={props.task.state?.changesRequested}
                  onRequest={() => props.goBack({ refresh: true })}
                />

                <ApproveSubmission
                  userTaskId={props.task.id}
                  allRevisionIds={props.allRevisionIds}
                  allUserTaskIds={props.allTaskIds}
                  onApprove={() => props.goBack({ refresh: true })}
                  reviewTaskId={props.reviewTaskId}
                />

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
                    onSaveRevision={async rev => {
                      console.log(rev);
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
