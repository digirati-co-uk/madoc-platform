import { useMutation, usePaginatedQuery } from 'react-query';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { ProjectFull } from '../../../../../types/project-full';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { WarningMessage } from '../../../../shared/callouts/WarningMessage';
import { useApi } from '../../../../shared/hooks/use-api';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { ProjectTaskOverview } from './project-task-overview';
import { loadProjectTaskOverview, overviewKey, overviewTaskLink, OverviewQuery } from './project-task-query';
import { useParams } from 'react-router-dom';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import React from 'react';
import { useData } from '../../../../shared/hooks/use-data';
import { TableRow, TableRowLabel } from '../../../../shared/layout/Table';
import { Status } from '../../../../shared/atoms/Status';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubjectSnippet } from '../../../../shared/components/SubjectSnippet';
import { ViewCrowdsourcingTask } from '../../../molecules/ViewCrowdsourcingTask';
import { ViewCrowdsourcingCanvasTask } from '../../tasks/crowdsourcing-canvas-task';
import { Project } from './project';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { useSite } from '../../../../shared/hooks/use-site';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { CrowdsourcingCanvasTask } from '../../../../../gateway/tasks/crowdsourcing-canvas-task';

type ProjectTasksType = {
  params: { id: number; taskId?: string };
  query: { page?: string; status?: string; sort_by?: string };
  variables: OverviewQuery & { id: number; taskId?: string };
  data: Awaited<ReturnType<typeof loadProjectTaskOverview>>;
  context: { project: ProjectFull };
};

export const ProjectTasks: UniversalComponent<ProjectTasksType> = createUniversalComponent<ProjectTasksType>(
  () => {
    const site = useSite();
    const { data: project } = useData(Project);
    const { t } = useTranslation();
    const params = useParams<{ id: string; taskId?: string }>();
    const query = useLocationQuery();
    const api = useApi();
    const [key, vars] = overviewKey({ id: Number(params.id), taskId: params.taskId }, query);
    // The shared wrapper always throws into a boundary; this page needs its own load-error state.
    const { resolvedData: data, status } = usePaginatedQuery([key, vars], () => loadProjectTaskOverview(api, vars), {
      useErrorBoundary: false,
    });
    const task = data?.parent;
    const selectedReviewer = project?.config?.manuallyAssignedReviewer;
    const [assignAllReviews, assignAllReviewsStatus] = useMutation(async () => {
      if (selectedReviewer) {
        // 1. Select all reviews in progress
        const reviewer = await api.getUser(selectedReviewer);
        const reviews = await api.getTasks(0, {
          all: true,
          root_task_id: (project as ProjectFull).task_id,
          type: 'crowdsourcing-review',
          detail: true,
          status: [0, 1, 2],
        });

        // 2. Filter those that are not assigned to the selected reviewer
        const toUpdate = reviews.tasks.filter(
          reviewTask => !reviewTask.assignee || reviewTask.assignee.id !== `urn:madoc:user:${selectedReviewer}`
        );
        // 3. Assign them to the selected reviewer
        if (reviewer?.user) {
          for (const review of toUpdate) {
            await api.updateTask(review.id, {
              assignee: { id: `urn:madoc:user:${selectedReviewer}`, name: `${reviewer.user.name}` },
            });
          }
        }
        return toUpdate.length;
      }
    });

    if (!project) return <>Loading...</>;

    const goToReviews = (
      <ButtonRow>
        <Button as="a" href={`/s/${site.slug}/projects/${project.id}/reviews`}>
          {t('Go to reviews')}
        </Button>
      </ButtonRow>
    );

    if (status === 'error') return <ErrorMessage>{t('Could not load tasks for this project')}</ErrorMessage>;

    if (!task || !project || !data || data.query.id !== vars.id || data.query.taskId !== vars.taskId) {
      return <>Loading...</>;
    }

    if (task.type === 'crowdsourcing-canvas-task') {
      return (
        <>
          {goToReviews}
          <ViewCrowdsourcingCanvasTask projectId={project.id} task={task as CrowdsourcingCanvasTask} />
        </>
      );
    }

    if (task.type === 'crowdsourcing-task') {
      return (
        <>
          {goToReviews}
          <ViewCrowdsourcingTask project={project} task={task as CrowdsourcingTask} />
          {(task.subtasks || []).map(subtask => (
            <TableRow key={subtask.id}>
              <TableRowLabel>
                <Status status={subtask.status || 0} text={t(subtask.status_text || 'unknown')} />
              </TableRowLabel>
              <TableRowLabel>{subtask.type}</TableRowLabel>
              <TableRowLabel>
                <Link to={`/projects/${project.id}/tasks/${subtask.id}`}>{subtask.name}</Link>
              </TableRowLabel>
            </TableRow>
          ))}
        </>
      );
    }

    return (
      <div>
        {goToReviews}
        {task.parent_task ? <Link to={overviewTaskLink(project.id, task.parent_task, data.query)}>Back</Link> : null}
        {task.root_task ? (
          <>
            <h2>{task.name}</h2>
            <SubjectSnippet subject={task.subject} />
          </>
        ) : null}
        {data.listing ? (
          <ProjectTaskOverview
            projectId={project.id}
            parentId={params.taskId}
            tasks={data.listing.tasks}
            pagination={data.listing.pagination}
            query={data.query}
            stale={status === 'loading'}
          />
        ) : null}

        <ButtonRow>
          {selectedReviewer ? (
            <Button disabled={assignAllReviewsStatus.isLoading} onClick={() => assignAllReviews()}>
              Assign all reviews {assignAllReviewsStatus.isLoading ? '(loading)' : `(id: ${selectedReviewer})`}
            </Button>
          ) : null}
        </ButtonRow>
        {assignAllReviewsStatus.isSuccess ? (
          assignAllReviewsStatus.data === 0 ? (
            <WarningMessage $banner>No reviews to update</WarningMessage>
          ) : (
            <SuccessMessage $banner>
              {t('Successfully assigned {{count}} reviews', { count: assignAllReviewsStatus.data })}
            </SuccessMessage>
          )
        ) : null}
      </div>
    );
  },
  {
    getKey: overviewKey,
    getData: (key, vars, api) => loadProjectTaskOverview(api, vars),
  }
);
