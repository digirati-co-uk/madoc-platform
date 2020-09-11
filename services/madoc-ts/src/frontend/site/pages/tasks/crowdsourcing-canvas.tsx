import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { CrowdsourcingCanvasTask } from '../../../../gateway/tasks/crowdsourcing-canvas-task';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { Status } from '../../../shared/atoms/Status';
import { TableContainer, TableEmpty, TableRow, TableRowLabel } from '../../../shared/atoms/Table';
import { useApi } from '../../../shared/hooks/use-api';
import { createLink } from '../../../shared/utility/create-link';

export const CrowdsourcingCanvas: React.FC<{ task: CrowdsourcingCanvasTask; reviewId: string; projectId: string }> = ({
  task,
  reviewId,
  projectId,
}) => {
  const api = useApi();
  const { data: parentTask } = useQuery(['task', { id: task.parent_task }], async () => {
    if (task.parent_task) {
      return api.getTask<CrowdsourcingTask>(task.parent_task);
    }
  });

  const allTasks = task.subtasks ? task.subtasks : undefined;
  const reviews = allTasks ? allTasks.filter(t => t.type === 'crowdsourcing-review') : undefined;

  return (
    <>
      {parentTask && parentTask.type === 'crowdsourcing-task' ? (
        <Link to={createLink({ projectId: projectId, taskId: reviewId, query: { preview: parentTask.id } })}>
          Back to task
        </Link>
      ) : null}
      <TableContainer>
        {reviews && reviews.length ? (
          reviews.map(subtask => (
            <TableRow key={subtask.id}>
              <TableRowLabel>
                <Status status={subtask.status} text={subtask.status_text} />
              </TableRowLabel>
              <TableRowLabel>
                <strong>{subtask.assignee?.name}</strong>
              </TableRowLabel>
              <TableRowLabel>
                <Link to={createLink({ projectId: projectId, taskId: subtask.id, query: { back_task: reviewId } })}>
                  {subtask.name}
                </Link>
              </TableRowLabel>
            </TableRow>
          ))
        ) : (
          <TableEmpty>None waiting</TableEmpty>
        )}
      </TableContainer>
    </>
  );
};
