import { useQuery } from 'react-query';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { useApi } from '../../shared/hooks/use-api';

export function useTaskMetadata<T extends any = any>(task?: BaseTask): T {
  const api = useApi();
  const { data } = useQuery(
    task ? `task-metadata/${task.id}` : undefined,
    async () => {
      if (task) {
        return api.tasks.getMetadata(task);
      }
    },
    { enabled: !!task }
  );

  return data ? data : task ? task.metadata || {} : {};
}
