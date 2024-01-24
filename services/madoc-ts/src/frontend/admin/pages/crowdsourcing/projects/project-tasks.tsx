import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { EmptyState } from '../../../../shared/layout/EmptyState';
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
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { useSite } from '../../../../shared/hooks/use-site';

type ProjectTasksType = {
  params: { id: number; taskId?: string };
  query: { page?: string };
  variables: { id: number; taskId?: string; page: number; project?: any };
  data: BaseTask;
  context: { project: any };
};

export const ProjectTasks: UniversalComponent<ProjectTasksType> = createUniversalComponent<ProjectTasksType>(
  () => {
    const site = useSite();
    const { data: project } = useData(Project);
    const { t } = useTranslation();
    const { data: task } = useData(ProjectTasks);

    const goToReviews = (
      <ButtonRow>
        <Button as="a" href={`/s/${site.slug}/projects/${project.id}/reviews`}>
          {t('Go to reviews')}
        </Button>
      </ButtonRow>
    );

    if (!task || !project) {
      return <>Loading...</>;
    }

    if (task.type === 'crowdsourcing-canvas-task') {
      return (
        <>
          {goToReviews}
          <ViewCrowdsourcingCanvasTask projectId={project.id} task={task as any} />
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
