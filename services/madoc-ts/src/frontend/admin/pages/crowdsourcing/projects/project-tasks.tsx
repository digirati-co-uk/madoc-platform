import { useMutation } from 'react-query';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { ProjectFull } from '../../../../../types/project-full';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { WarningMessage } from '../../../../shared/callouts/WarningMessage';
import { useApi } from '../../../../shared/hooks/use-api';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import React from 'react';
import { BaseTask } from '../../../../../gateway/tasks/base-task';
import { useData } from '../../../../shared/hooks/use-data';
import { TableRow, TableRowLabel } from '../../../../shared/layout/Table';
import { Status } from '../../../../shared/atoms/Status';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SubjectSnippet } from '../../../../shared/components/SubjectSnippet';
import { ViewCrowdsourcingTask } from '../../../molecules/ViewCrowdsourcingTask';
import { ViewCrowdsourcingCanvasTask } from '../../tasks/crowdsourcing-canvas-task';
import { Project } from './project';

type ProjectTasksType = {
  params: { id: number; taskId?: string };
  query: { page?: string };
  variables: { id: number; taskId?: string; page: number; project?: any };
  data: BaseTask;
  context: { project: any };
};

export const ProjectTasks: UniversalComponent<ProjectTasksType> = createUniversalComponent<ProjectTasksType>(
  () => {
    const { data: project } = useData(Project);
    const { t } = useTranslation();
    const { data: task } = useData(ProjectTasks);
    const api = useApi();
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

    if (!task || !project) {
      return <>Loading...</>;
    }

    if (task.type === 'crowdsourcing-canvas-task') {
      return <ViewCrowdsourcingCanvasTask projectId={project.id} task={task as any} />;
    }

    if (task.type === 'crowdsourcing-task') {
      return (
        <>
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
        {task.parent_task ? <Link to={`/projects/${project.id}/tasks/${task.parent_task}`}>Back</Link> : null}
        {task.root_task ? (
          <>
            <h2>{task.name}</h2>
            <SubjectSnippet subject={task.subject} />
          </>
        ) : null}
        {Object.keys(task.state).length ? <pre>{JSON.stringify(task.state, null, 2)}</pre> : null}
        {task.subtasks?.length === 0 ? <EmptyState>{t('Nothing contributed yet')}</EmptyState> : null}
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
    getKey: (params, query) => {
      return ['project-tasks', { id: params.id, page: query.page ? Number(query.page) : 0, taskId: params.taskId }];
    },
    getData: async (key, vars, api) => {
      if (vars.taskId) {
        return api.getTaskById<BaseTask>(vars.taskId, true);
      }

      const project = vars.project ? vars.project : await api.getProject(vars.id);

      return api.getTaskById<BaseTask>(project.task_id, true);
    },
  }
);
