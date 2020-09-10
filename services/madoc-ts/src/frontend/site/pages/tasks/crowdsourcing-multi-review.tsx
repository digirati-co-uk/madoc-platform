import React, { Suspense, useCallback, useMemo } from 'react';
import { useQuery } from 'react-query';
import { CrowdsourcingCanvasTask } from '../../../../gateway/tasks/crowdsourcing-canvas-task';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import { BreadcrumbContainer, Breadcrumbs } from '../../../shared/atoms/Breadcrumbs';
import { Heading1, Subheading1 } from '../../../shared/atoms/Heading1';
import {
  KanbanAssignee,
  KanbanBoard,
  KanbanBoardContainer,
  KanbanCard,
  KanbanCardButton,
  KanbanCardInner,
  KanbanCol,
  KanbanColTitle,
  KanbanLabel,
  KanbanType,
  KanbanEmpty,
  KanbanCardTextButton,
} from '../../../shared/atoms/Kanban';
import { useApi } from '../../../shared/hooks/use-api';
import { Heading3, Subheading3 } from '../../../shared/atoms/Heading3';
import { Link, useParams, useHistory } from 'react-router-dom';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import TimeAgo from 'react-timeago';
import { createLink } from '../../../shared/utility/create-link';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { HrefLink } from '../../../shared/utility/href-link';
import { CrowdsourcingCanvas } from './crowdsourcing-canvas';
import { CrowdsourcingManifestReview } from './crowdsourcing-manifest-review';
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
  const { data, refetch: refetchTask } = useQuery(
    ['multi-review-tasks', { id: reviewTask.id }],
    async () => {
      return await api.getTasks<CrowdsourcingTask>(0, {
        all: true,
        // status: [-1, 0, 1, 2, 3, 4],
        parent_task_id: reviewTask.parent_task,
        type: 'crowdsourcing-task',
        detail: true,
      });
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    }
  );
  const { data: backTask } = useQuery(['back-task', { subject: reviewTask.subject_parent }], async () => {
    if (reviewTask.subject_parent) {
      const { tasks: allBackTasks } = await api.getTasks<CrowdsourcingReview>(0, {
        all: true,
        type: 'crowdsourcing-review',
        subject: reviewTask.subject_parent,
        status: [0, 1, 2, 4],
        root_task_id: reviewTask.root_task,
      });

      if (allBackTasks.length) {
        return allBackTasks[0];
      }
    }
  });

  const lockedTasks = useMemo(
    () =>
      reviewTask.state.currentMerge
        ? [...reviewTask.state.currentMerge.toMerge, reviewTask.state.currentMerge.revisionId]
        : [],
    [reviewTask.state.currentMerge]
  );
  const previewTask = data ? data.tasks.find(t => t.id === preview) : undefined;

  const header = backTask ? (
    <>
      <Breadcrumbs
        type="site"
        items={[
          backTask ? { label: backTask.name, link: createLink({ projectId: slug, taskId: backTask.id }) } : undefined,
          {
            label: reviewTask.name,
            link: createLink({ projectId: slug, taskId: reviewTask.id }),
            active: !!previewTask,
          },
          previewTask
            ? {
                label: previewTask.name,
                link: createLink({ projectId: slug, taskId: reviewTask.id, query: { preview: previewTask.id } }),
                active: true,
              }
            : undefined,
        ]}
      />
      <Heading3>{reviewTask.name}</Heading3>
      {reviewTask.created_at ? (
        <Subheading3>
          <TimeAgo date={reviewTask.created_at} />
        </Subheading3>
      ) : null}
    </>
  ) : null;

  const refreshAll = useCallback(() => {
    return Promise.all(
      [refetchTask({ force: true }), refetch ? refetch() : null].filter(r => r !== null) as Promise<void>[]
    );
  }, [refetch, refetchTask]);

  if (!data) {
    return (
      <>
        {header}
        <div>Loading...</div>
      </>
    );
  }

  // @todo ????
  if (reviewTask.state.baseRevisionId) {
    return <div>Base revision chosen</div>;
  }

  if (reviewTask.state.currentMerge && reviewTask.state.currentMerge.mergeId === preview) {
    return (
      <>
        {header}
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
      </>
    );
  }

  const waiting = data.tasks.filter(t => t.status <= 1 || t.status === 4);
  const ready = data.tasks.filter(
    t => t.status > 1 && t.status !== 4 && t.status !== 3 && t.state.reviewTask === reviewTask.id
  );
  const complete = data.tasks.filter(t => t.status === 3 && t.state.reviewTask === reviewTask.id);
  // These are other reviews adjacent.
  // const otherReviews = data.tasks.filter(t => t.state.reviewTask !== reviewTask.id);
  const allRevisionIds = ready.map(task => task.state.revisionId as string);
  const allTaskIds = ready.map(task => task.id as string);

  if (previewTask) {
    return (
      <>
        {header}
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
      </>
    );
  }

  return (
    <div>
      {header}
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

      <Heading3 $margin>This review covers the following contributions</Heading3>

      <KanbanBoard>
        <KanbanBoardContainer>
          <KanbanCol>
            <KanbanColTitle>Waiting for contributor</KanbanColTitle>
            {waiting.length ? (
              waiting.map(task => (
                <KanbanCard key={task.id}>
                  <KanbanCardInner>
                    <KanbanLabel>{task.name}</KanbanLabel>
                    {task.modified_at ? (
                      <KanbanType>
                        <TimeAgo date={task.modified_at} />
                      </KanbanType>
                    ) : null}
                  </KanbanCardInner>
                  {task.assignee && task.assignee.name ? <KanbanAssignee>{task.assignee.name}</KanbanAssignee> : null}
                </KanbanCard>
              ))
            ) : (
              <KanbanEmpty>None waiting</KanbanEmpty>
            )}
          </KanbanCol>
          <KanbanCol>
            <KanbanColTitle>Ready for review</KanbanColTitle>
            {ready.length ? (
              ready.map(task => (
                <KanbanCard key={task.id}>
                  <KanbanCardInner>
                    <KanbanLabel>{task.name}</KanbanLabel>
                    {task.modified_at ? (
                      <KanbanType>
                        <TimeAgo date={task.modified_at} />
                      </KanbanType>
                    ) : null}
                  </KanbanCardInner>
                  {task.assignee && task.assignee.name ? <KanbanAssignee>{task.assignee.name}</KanbanAssignee> : null}
                  {task.status > 0 && task.state.reviewTask === reviewTask.id ? (
                    <KanbanCardButton
                      as={HrefLink}
                      href={createLink({ projectId: slug, taskId: reviewTask.id, query: { preview: task.id } })}
                    >
                      Review contribution
                    </KanbanCardButton>
                  ) : null}
                </KanbanCard>
              ))
            ) : (
              <KanbanEmpty>None ready</KanbanEmpty>
            )}
          </KanbanCol>
          <KanbanCol>
            <KanbanColTitle>Completed reviews</KanbanColTitle>
            {complete.length ? (
              complete.map(task => (
                <KanbanCard key={task.id}>
                  <KanbanCardInner>
                    <KanbanLabel>{task.name}</KanbanLabel>
                    {task.modified_at ? (
                      <KanbanType>
                        <TimeAgo date={task.modified_at} />
                      </KanbanType>
                    ) : null}
                  </KanbanCardInner>
                  {task.assignee && task.assignee.name ? <KanbanAssignee>{task.assignee.name}</KanbanAssignee> : null}
                  {task.status > 0 && task.state.reviewTask === reviewTask.id ? (
                    <KanbanCardTextButton
                      as={HrefLink}
                      href={createLink({ projectId: slug, taskId: reviewTask.id, query: { preview: task.id } })}
                    >
                      View contribution
                    </KanbanCardTextButton>
                  ) : null}
                </KanbanCard>
              ))
            ) : (
              <KanbanEmpty>None complete</KanbanEmpty>
            )}
          </KanbanCol>
        </KanbanBoardContainer>
      </KanbanBoard>
    </div>
  );
};
