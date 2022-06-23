import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { CrowdsourcingReview } from '../../../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { NotFound } from '../../../../../utility/errors/not-found';
import { EditorSlots } from '../../../../shared/capture-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../../../shared/capture-models/new/components/RevisionProviderWithFeatures';
import { SimpleSaveButton } from '../../../../shared/capture-models/new/components/SimpleSaveButton';
import { EditorContentViewer } from '../../../../shared/capture-models/new/EditorContent';
import { useData } from '../../../../shared/hooks/use-data';
import { PreviewIcon } from '../../../../shared/icons/PreviewIcon';
import { ReadMoreIcon } from '../../../../shared/icons/ReadMoreIcon';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import {
  EditorToolbarButton,
  EditorToolbarIcon,
  EditorToolbarLabel,
} from '../../../../shared/navigation/EditorToolbar';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../../shared/utility/href-link';
import { RefetchProvider, useRefetch } from '../../../../shared/utility/refetch-context';
import { useCrowdsourcingTaskDetails } from '../../../hooks/use-crowdsourcing-task-details';
import { ApproveSubmission } from '../actions/approve-submission';
import { RejectSubmission } from '../actions/reject-submission';
import { RequestChanges } from '../actions/request-changes';

function ViewSingleReview({
  task,
  review,
}: {
  task: CrowdsourcingTask & { id: string };
  review: (CrowdsourcingReview & { id: string }) | null;
}) {
  const {
    captureModel,
    revisionId,
    wasRejected,
    canvas,
    project,
    canvasLink,
    manifestLink,
  } = useCrowdsourcingTaskDetails(task);
  const refetch = useRefetch();

  if (!review) {
    return <EmptyState>This task is not yet ready for review.</EmptyState>;
  }

  return (
    <RevisionProviderWithFeatures
      revision={revisionId}
      captureModel={captureModel}
      slotConfig={{
        editor: { allowEditing: false },
        components: { SubmitButton: SimpleSaveButton },
      }}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ width: 420 }}>
            {canvas ? <EditorContentViewer height={300} canvasId={canvas.id} /> : null}
            <EditorSlots.TopLevelEditor />
          </div>
        </div>

        <div style={{ width: 300 }}>
          {review && !wasRejected ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {canvasLink ? (
                <EditorToolbarButton as={HrefLink} href={canvasLink} $leftBorder>
                  <EditorToolbarIcon>
                    <PreviewIcon />
                  </EditorToolbarIcon>
                  <EditorToolbarLabel>View resource</EditorToolbarLabel>
                </EditorToolbarButton>
              ) : null}
              {manifestLink ? (
                <EditorToolbarButton as={HrefLink} href={manifestLink} $leftBorder>
                  <EditorToolbarIcon>
                    <PreviewIcon />
                  </EditorToolbarIcon>
                  <EditorToolbarLabel>View manifest</EditorToolbarLabel>
                </EditorToolbarButton>
              ) : null}

              <RejectSubmission
                userTaskId={task.id}
                onReject={() => {
                  refetch();
                }}
              />

              <RequestChanges
                userTaskId={task.id}
                changesRequested={task.state?.changesRequested}
                onRequest={() => {
                  refetch();
                }}
              />

              {/*<StartMerge*/}
              {/*  allTasks={props.allTasks as any}*/}
              {/*  reviewTaskId={data.review.id}*/}
              {/*  userTask={task}*/}
              {/*  // onStartMerge={(revId: string) => props.goBack({ refresh: true, revisionId: revId })}*/}
              {/*/>*/}

              <ApproveSubmission
                project={project}
                userTaskId={task.id}
                onApprove={() => {
                  refetch();
                }}
                reviewTaskId={review.id}
              />
            </div>
          ) : null}
        </div>
      </div>
    </RevisionProviderWithFeatures>
  );
}

export function SingleReview() {
  const params = useParams<{ taskId: string }>();
  const { data, refetch } = useData(SingleReview);

  if (!data) {
    return <div>Loading...</div>;
  }

  if (!data.task) {
    return <Navigate to={`/tasks/${params.taskId}`} />;
  }

  return (
    <RefetchProvider refetch={refetch}>
      <ViewSingleReview task={data.task} review={data.review} />
    </RefetchProvider>
  );
}

serverRendererFor(SingleReview, {
  getKey: params => {
    return ['single-review', { id: params.taskId }];
  },
  async getData(key, vars, api) {
    const task = await api.getTask(vars.id);
    if (!task || !task.state || !task.state.reviewTask) {
      return {
        review: null,
        task,
      };
    }
    return {
      review: await api.getTask(task.state.reviewTask),
      task,
    };
  },
});
