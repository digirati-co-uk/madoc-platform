import React, { Suspense, useCallback, useMemo } from 'react';
import { useQuery } from 'react-query';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import { useApi } from '../../../shared/hooks/use-api';
import { Heading3, Subheading3 } from '../../../shared/atoms/Heading3';
import { TableContainer, TableEmpty, TableRow, TableRowLabel } from '../../../shared/atoms/Table';
import { Status } from '../../../shared/atoms/Status';
import { Link, useParams, useHistory } from 'react-router-dom';
import { CrowdsourcingTask } from '../../../../types/tasks/crowdsourcing-task';
import { GridContainer, HalfGird } from '../../../shared/atoms/Grid';
import TimeAgo from 'react-timeago';
import { createLink } from '../../../shared/utility/create-link';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { PreviewCrowdsourcingTask } from './preview-crowdsourcing-task.lazy';
import { MergeCrowdsourcingTask } from './merge-crowdsourcing-task.lazy';
import { WarningMessage } from '../../../shared/atoms/WarningMessage';

// Step 1 - review each and wait for completion
// Step 2 - request any changes on individual items or remove them
//   - List of tasks + actions
//   - Preview tasks capture model in read-only mode
// Step 3 - select a base revision to start from
// Step 4 - built up the revision using the other as reference - with quick copy from other fields
//   - Merging editor
// Step 5 - Save everything up and set all of the relevant tasks

export const CrowdsourcingMultiReview: React.FC<{ task: CrowdsourcingReview; refetch?: () => Promise<void> }> = ({
  task: reviewTask,
  refetch,
}) => {
  const api = useApi();
  const { slug } = useParams();
  const history = useHistory();
  const { preview } = useLocationQuery();
  const { data, refetch: refetchTask } = useQuery(['multi-review-tasks', { id: reviewTask.id }], async () => {
    return await api.getTasks<CrowdsourcingTask>(0, {
      all: true,
      // status: [-1, 0, 1, 2, 3, 4],
      parent_task_id: reviewTask.parent_task,
      type: 'crowdsourcing-task',
      detail: true,
    });
  });
  const lockedTasks = useMemo(
    () =>
      reviewTask.state.currentMerge
        ? [...reviewTask.state.currentMerge.toMerge, reviewTask.state.currentMerge.revisionId]
        : [],
    [reviewTask.state.currentMerge]
  );
  const previewTask = data ? data.tasks.find(t => t.id === preview) : undefined;

  const refreshAll = useCallback(() => {
    return Promise.all(
      [refetchTask({ force: true }), refetch ? refetch() : null].filter(r => r !== null) as Promise<void>[]
    );
  }, [refetch, refetchTask]);

  if (!data) {
    return <div>Loading...</div>;
  }

  if (reviewTask.state.baseRevisionId) {
    return <div>Base revision chosen</div>;
  }

  if (reviewTask.state.currentMerge && reviewTask.state.currentMerge.mergeId === preview) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <MergeCrowdsourcingTask
          merge={reviewTask.state.currentMerge}
          goBack={async opt => {
            if (opt?.refresh) {
              await refreshAll();
            }
            const rev = opt?.revisionId;
            history.push(
              createLink({ projectId: slug, taskId: reviewTask.id, query: rev ? { preview: rev } : undefined })
            );
          }}
          reviewTaskId={reviewTask.id as string}
        />
      </Suspense>
    );
  }

  const waiting = data.tasks.filter(t => t.status <= 1 || t.status === 4);
  const ready = data.tasks.filter(t => t.status > 1 && t.status !== 4 && t.state.reviewTask === reviewTask.id);
  const otherReviews = data.tasks.filter(t => t.state.reviewTask !== reviewTask.id);
  const allRevisionIds = ready.map(task => task.state.revisionId as string);
  const allTaskIds = ready.map(task => task.id as string);

  if (previewTask) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <PreviewCrowdsourcingTask
          allTaskIds={allTaskIds}
          lockedTasks={lockedTasks}
          allRevisionIds={allRevisionIds}
          allTasks={ready}
          task={previewTask as any}
          goBack={async opt => {
            if (opt?.refresh && refetch) {
              await refreshAll();
            }
            const rev = opt?.revisionId;
            history.push(
              createLink({ projectId: slug, taskId: reviewTask.id, query: rev ? { preview: rev } : undefined })
            );
          }}
          reviewTaskId={reviewTask.id as string}
        />
      </Suspense>
    );
  }

  return (
    <div>
      {reviewTask.state.currentMerge ? (
        <WarningMessage>
          There is a merge in progress{' '}
          <Link
            to={createLink({
              projectId: slug,
              taskId: reviewTask.id,
              query: { preview: reviewTask.state.currentMerge.mergeId },
            })}
          >
            Go to merge
          </Link>
        </WarningMessage>
      ) : null}
      <Heading3>This review covers the following contributions</Heading3>
      <GridContainer>
        <HalfGird $margin>
          <Subheading3>Waiting for contributor</Subheading3>
          <TableContainer>
            {waiting.length ? (
              waiting.map(task => (
                <TableRow key={task.id}>
                  <TableRowLabel>
                    <Status status={task.status} text={task.status_text} />
                  </TableRowLabel>
                  <TableRowLabel>
                    <strong>{task.assignee?.name}</strong>
                  </TableRowLabel>
                  <TableRowLabel>
                    {task.status > 0 && task.state.reviewTask === reviewTask.id ? (
                      <Link to={createLink({ projectId: slug, taskId: reviewTask.id, query: { preview: task.id } })}>
                        {task.name}
                      </Link>
                    ) : (
                      task.name
                    )}
                  </TableRowLabel>
                  {task.modified_at ? (
                    <TableRowLabel>
                      <TimeAgo date={task.modified_at} />
                    </TableRowLabel>
                  ) : null}
                </TableRow>
              ))
            ) : (
              <TableEmpty>None waiting</TableEmpty>
            )}
          </TableContainer>
        </HalfGird>
        <HalfGird $margin>
          <Subheading3>Ready to review</Subheading3>
          <TableContainer>
            {ready.length ? (
              ready.map(task => (
                <TableRow key={task.id}>
                  <TableRowLabel>
                    <Status status={task.status} text={task.status_text} />
                  </TableRowLabel>
                  <TableRowLabel>
                    <strong>{task.assignee?.name}</strong>
                  </TableRowLabel>
                  <TableRowLabel>
                    {task.state.reviewTask === reviewTask.id ? (
                      <Link to={createLink({ projectId: slug, taskId: reviewTask.id, query: { preview: task.id } })}>
                        {task.name}
                      </Link>
                    ) : (
                      task.name
                    )}
                  </TableRowLabel>
                  {task.modified_at ? (
                    <TableRowLabel>
                      <TimeAgo date={task.modified_at} />
                    </TableRowLabel>
                  ) : null}
                </TableRow>
              ))
            ) : (
              <TableEmpty>None ready</TableEmpty>
            )}
          </TableContainer>
        </HalfGird>
      </GridContainer>
      <GridContainer>
        <HalfGird>
          <Subheading3>Previously reviewed</Subheading3>
          <TableContainer>
            {otherReviews.length ? (
              otherReviews.map(task => (
                <TableRow key={task.id}>
                  <TableRowLabel>
                    <Status status={task.status} text={task.status_text} />
                  </TableRowLabel>
                  <TableRowLabel>
                    <strong>{task.assignee?.name}</strong>
                  </TableRowLabel>
                  <TableRowLabel>
                    <Link to={createLink({ projectId: slug, taskId: task.state.reviewTask })}>
                      {task.name}
                    </Link>
                  </TableRowLabel>
                  {task.modified_at ? (
                    <TableRowLabel>
                      <TimeAgo date={task.modified_at} />
                    </TableRowLabel>
                  ) : null}
                </TableRow>
              ))
            ) : (
              <TableEmpty>None ready</TableEmpty>
            )}
          </TableContainer>
        </HalfGird>
      </GridContainer>
    </div>
  );
};
