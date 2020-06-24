import React from 'react';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import { useMutation, useQuery } from 'react-query';
import { useApi } from '../../../shared/hooks/use-api';
import { CrowdsourcingTask } from '../../../../types/tasks/crowdsourcing-task';
import { EntityTopLevel } from '../../../shared/caputre-models/EntityTopLevel';
import TimeAgo from 'react-timeago';
import { RevisionRequest } from '@capture-models/types';
import { Button } from '../../../shared/atoms/Button';
import { Debug } from '../../../shared/atoms/Debug';

export const ViewCrowdsourcingReview: React.FC<{ task: CrowdsourcingReview }> = ({ task }) => {
  // A review.
  // parameters[0] is the direct task that's being reviewed.
  // We might want to make a query for:
  //  - matching root task / project
  //  - matching subject
  // This will hopefully return a list of other users tasks for the same subject and also other reviews for this.
  // Using this, we could provide a combined review interface.
  // Next is the capture model, we need to load that in.
  // - Using the model load the revision being reviewed
  // - Display the revision in preview-mode
  // - 3 buttons
  //    - accept + accept comment
  //    - request changes + changes request
  //    - reject + rejection comment
  // Space for an _internal_ note.
  //
  // How will multiple-reviews work
  // 1. Choose base revision
  // 2. Step through each field, showing other users submission
  // 3. Possible diff
  // 4. Possible switcher for changing revision compared
  // 5. Base revision accepted, other revisions removed
  // 6. All tasks marked as accepted, unless manually rejected.
  // 7. Revision marked as canonical

  //
  // Things to load.
  //
  //    - Task being loaded
  //    - Task subject
  //    - Capture model / revision from task subject
  //
  //
  // Actions.
  //
  //     - Accept task + comment + merge revision
  //     - Reject + comment + delete revision
  //     - Request changes + comment
  //     - Leave internal comment
  //
  //

  const api = useApi();
  const { data, refetch } = useQuery(['review-task', { id: task.id }], async () => {
    const subjectTaskId = task.parameters[0];
    const subjectTask = await api.getTaskById<CrowdsourcingTask>(subjectTaskId);
    try {
      const [captureModelId, structureId, resourceType] = subjectTask.parameters;
      const captureModel = task.status >= 0 ? await api.getCaptureModel(captureModelId) : null;
      const revision =
        task.status >= 0 && subjectTask.state.revisionId
          ? await api.getCaptureModelRevision(subjectTask.state.revisionId)
          : undefined;

      // - Task being loaded
      // - Task subject
      // - Capture model / revision from task subject

      return { subjectTask, captureModel, structureId, resourceType, revision };
    } catch (err) {
      return { subjectTask };
    }
  });

  const [approveRevision] = useMutation(async (req: RevisionRequest) => {
    // Approving.
    // 1. Approve capture model revision
    await api.approveCaptureModelRevision(req);

    // 2. Update this task to be approved (the events API will update the subject.)
    await api.updateTask(task.id, { status: 3, status_text: 'Approved' });

    await refetch();
  });

  const [requestChanges] = useMutation(async (req: RevisionRequest) => {
    // Update the task.
    await api.updateTask(task.id, { status: 4, status_text: 'Changes requested' });

    // Redraft it.
    await api.reDraftCaptureModelRevision(req);

    await refetch();
  });

  const [deleteRevision] = useMutation(async (req: RevisionRequest) => {
    // 1. Mark task as rejected.
    await api.updateTask(task.id, { status: -1, status_text: 'Rejected' });

    // 2. Delete revision.
    await api.deleteCaptureModelRevision(req);

    await refetch();
  });

  return (
    <div>
      <h3>
        {task.name} ({task.status_text})
      </h3>
      {task.created_at ? <TimeAgo date={task.created_at} /> : null}
      {task.status === -1 && (
        <div>
          <strong>This has been rejected and deleted.</strong>
        </div>
      )}
      {data && data.revision ? (
        <>
          <div style={{ padding: 20, margin: '20px 0', border: '2px solid #ddd' }}>
            <EntityTopLevel
              setSelectedField={() => null}
              setSelectedEntity={() => null}
              path={[]}
              entity={{ instance: data.revision.document, property: 'root' }}
              readOnly={true}
              hideSplash={true}
              hideCard={true}
            />
          </div>
          {task.status !== 3 && task.status !== -1 ? (
            <div>
              <Button onClick={() => (data.revision ? approveRevision(data.revision) : undefined)}>Approve</Button>
              <Button onClick={() => (data.revision ? deleteRevision(data.revision) : undefined)}>
                Reject and delete
              </Button>
            </div>
          ) : (
            <>
              {task.status === 3 ? <div>This has been approved</div> : null}
              {task.status === -1 ? <div>This has been rejected</div> : null}
            </>
          )}
        </>
      ) : null}
      <hr />
      <Debug>{data}</Debug>
    </div>
  );
};
