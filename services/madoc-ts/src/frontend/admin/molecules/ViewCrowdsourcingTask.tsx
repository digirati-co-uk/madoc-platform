import React from 'react';
import { Link } from 'react-router-dom';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { ProjectListItem } from '../../../types/schemas/project-list-item';
import { Status } from '../../shared/atoms/Status';
import { useApiCaptureModel } from '../../shared/hooks/use-api-capture-model';

export const ViewCrowdsourcingTask: React.FC<{ task: CrowdsourcingTask; project: ProjectListItem }> = ({
  task,
  project,
}) => {
  const { data: captureModel } = useApiCaptureModel(task.parameters[0]);

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
