import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import React from 'react';
import { BaseTask } from '../../../../../gateway/tasks/base-task';
import { useData } from '../../../../shared/hooks/use-data';
import { TableRow, TableRowLabel } from '../../../../shared/atoms/Table';
import { Status } from '../../../../shared/atoms/Status';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CrowdsourcingTask } from '../../../../../types/tasks/crowdsourcing-task';
import { useApi } from '../../../../shared/hooks/use-api';
import { useQuery } from 'react-query';
import { SubjectSnippet } from '../../../../shared/components/SubjectSnippet';
import { ProjectListItem } from '../../../../../types/schemas/project-list-item';

type ProjectTasksType = {
  params: { id: number; taskId?: string };
  query: { page?: string };
  variables: { id: number; taskId?: string; page: number; project?: any };
  data: BaseTask;
  context: { project: any };
};

const ViewCrowdsourcingTask: React.FC<{ task: CrowdsourcingTask; project: ProjectListItem }> = ({ task, project }) => {
  const api = useApi();
  const { data: captureModel, refetch } = useQuery(
    ['capture-model', { id: task.parameters[0] }],
    async () => {
      return api.getCaptureModel(task.parameters[0]);
    },
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchIntervalInBackground: false,
    }
  );

  return (
    <div>
      {task.parent_task ? <Link to={`/projects/${project.id}/tasks/${task.parent_task}`}>Back</Link> : null}
      <h3>{task.name}</h3>
      {task.assignee ? (
        <div>
          Assigned to <strong>{task.assignee.name}</strong>
        </div>
      ) : null}
      <div style={{ display: 'flex' }}>
        <Status status={task.status} interactive={false} />
        <div style={{ margin: 'auto 0' }}>
          Task status: <em>{task.status_text}</em>
        </div>
      </div>
      {captureModel ? <pre>{JSON.stringify(captureModel, null, 2)}</pre> : null}
    </div>
  );
};

export const ProjectTasks: UniversalComponent<ProjectTasksType> = createUniversalComponent<ProjectTasksType>(
  ({ project }) => {
    const { t } = useTranslation();
    const { data: task } = useData(ProjectTasks);

    if (!task) {
      return <>Loading...</>;
    }

    if (task.type === 'crowdsourcing-task') {
      return <ViewCrowdsourcingTask project={project} task={task as CrowdsourcingTask} />;
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
