import ReactTimeago from 'react-timeago';
import { BaseTask } from '../../../../gateway/tasks/base-task';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useApi } from '../../../shared/hooks/use-api';
import { SortedTaskList } from '../../molecules/SortedTaskList';

export const GenericTask: React.FC<{ task: BaseTask; statusBar?: JSX.Element; snippet?: JSX.Element }> = ({
  task,
  statusBar,
  snippet,
}) => {
  const api = useApi();
  const [taskStatusMap, setTaskStatusMap] = useState<any>({});

  const [trigger] = useMutation(async (taskId: string) => {
    setTaskStatusMap((m: any) => {
      return { ...m, [taskId]: true };
    });

    await api.updateTaskStatus(taskId, ['waiting'], 'waiting');
    setTaskStatusMap((m: any) => {
      return { ...m, [taskId]: false };
    });
  });

  return (
    <div>
      <h1>{task.name}</h1>
      {snippet}
      {task.description ? <p>{task.description}</p> : null}
      <p>{task.created_at ? <ReactTimeago date={task.created_at} /> : null}</p>
      {statusBar}
      <SortedTaskList tasks={task.subtasks || []} trigger={trigger} taskStatusMap={taskStatusMap} />
    </div>
  );
};
