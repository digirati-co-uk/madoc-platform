import React, { Suspense, useCallback, useMemo } from 'react';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import { extractIdFromUrn, parseUrn } from '../../../../utility/parse-urn';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import { useProjectByTask } from '../../../shared/hooks/use-project-by-task';
import { Breadcrumbs } from '../../../shared/navigation/Breadcrumbs';
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
import { Heading3, Subheading3 } from '../../../shared/typography/Heading3';
import { Link, useParams, useHistory } from 'react-router-dom';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { useApiTaskSearch } from '../../../shared/hooks/use-api-task-search';
import { createLink } from '../../../shared/utility/create-link';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { HrefLink } from '../../../shared/utility/href-link';
import { PreviewCrowdsourcingTask } from './preview-crowdsourcing-task.lazy';
import { MergeCrowdsourcingTask } from './merge-crowdsourcing-task.lazy';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { PreviewManifestCrowdsourcingTask } from './preview-manifest-crowdsourcing-task';

export const CrowdsourcingMultiReview: React.FC<{ task: CrowdsourcingReview; refetch?: () => Promise<void> }> = ({
  task: reviewTask,
  refetch,
}) => {
  const { slug: _slug } = useParams<{ slug: string }>();
  const history = useHistory();
  const { preview, ...query } = useLocationQuery();

  const { data, refetch: refetchTask } = useApiTaskSearch<CrowdsourcingTask>({
    all: true,
    parent_task_id: reviewTask.parent_task,
    type: 'crowdsourcing-task',
    detail: true,
  });
  const project = useProjectByTask(reviewTask);
  const slug = _slug || project?.slug;

  const backTasks = useApiTaskSearch<CrowdsourcingReview>(
    {
      all: true,
      type: 'crowdsourcing-review',
      subject: reviewTask.subject_parent,
      status: [0, 1, 2, 4],
      root_task_id: reviewTask.root_task,
    },
    {
      enabled: !!reviewTask.subject_parent,
    }
  );
  const backTask = backTasks.data ? backTasks.data.tasks[0] : undefined;

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
          backTask
            ? { label: backTask.name, link: createLink({ projectId: slug, taskId: backTask.id, query }) }
            : undefined,
          {
            label: reviewTask.name,
            link: createLink({ projectId: slug, taskId: reviewTask.id, query }),
            active: !previewTask,
          },
          previewTask
            ? {
                label: previewTask.name,
                link: createLink({
                  projectId: slug,
                  taskId: reviewTask.id,
                  query: { preview: previewTask.id, ...query },
                }),
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
    return Promise.all([refetchTask(), refetch ? refetch() : null].filter(r => r !== null) as Promise<void>[]);
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
                createLink({ projectId: slug, taskId: reviewTask.id, query: rev ? { preview: rev, ...query } : query })
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
    const subject = parseUrn(previewTask.subject);

    if (!subject) {
      return <ErrorMessage $banner>Invalid task</ErrorMessage>;
    }

    const goBack = async (opt: any) => {
      if (opt?.refresh && refetch) {
        await refreshAll();
      }
      const rev = opt?.revisionId;
      history.push(
        createLink({ projectId: slug, taskId: reviewTask.id, query: rev ? { preview: rev, ...query } : query })
      );
    };

    if (subject.type === 'manifest') {
      return (
        <PreviewManifestCrowdsourcingTask
          allTaskIds={allTaskIds}
          lockedTasks={lockedTasks}
          allRevisionIds={allRevisionIds}
          allTasks={ready}
          task={previewTask as any}
          goBack={goBack}
          reviewTaskId={reviewTask.id as string}
        />
      );
    }

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
            goBack={goBack}
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
              query: { preview: reviewTask.state.currentMerge.mergeId, ...query },
            })}
          >
            Go to merge
          </Link>
        </WarningMessage>
      ) : null}

      <Heading3 $margin>This review covers the following contributions</Heading3>

      <KanbanBoard>
        <KanbanBoardContainer>
          <KanbanCol data-cy="kanban-waiting-for-contributor">
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
                  {task.assignee && task.assignee.name ? (
                    <KanbanAssignee href={`/users/${extractIdFromUrn(task.assignee.id)}`}>
                      {task.assignee.name}
                    </KanbanAssignee>
                  ) : null}
                </KanbanCard>
              ))
            ) : (
              <KanbanEmpty>None waiting</KanbanEmpty>
            )}
          </KanbanCol>
          <KanbanCol data-cy="kanban-ready-for-review">
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
                  {task.assignee && task.assignee.name ? (
                    <KanbanAssignee href={`/users/${extractIdFromUrn(task.assignee.id)}`}>
                      {task.assignee.name}
                    </KanbanAssignee>
                  ) : null}
                  {task.status > 0 && task.state.reviewTask === reviewTask.id ? (
                    <KanbanCardButton
                      as={HrefLink}
                      href={createLink({
                        projectId: slug,
                        taskId: reviewTask.id,
                        query: { preview: task.id, ...query },
                      })}
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
          <KanbanCol data-cy="kanban-completed-reviews">
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
                  {task.assignee && task.assignee.name ? (
                    <KanbanAssignee href={`/users/${extractIdFromUrn(task.assignee.id)}`}>
                      {task.assignee.name}
                    </KanbanAssignee>
                  ) : null}
                  {task.status > 0 && task.state.reviewTask === reviewTask.id ? (
                    <KanbanCardTextButton
                      as={HrefLink}
                      href={createLink({
                        projectId: slug,
                        taskId: reviewTask.id,
                        query: { preview: task.id, ...query },
                      })}
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
