import { useQuery } from 'react-query';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { useApi } from './use-api';

export function useApiTask<Task extends BaseTask = BaseTask>(taskId?: string) {
  const api = useApi();
  return useQuery(
    ['api-get-task', { id: taskId }],
    async () => {
      if (taskId) {
        return api.getTask<Task>(taskId);
      }
    },
    {
      enabled: !!taskId,
    }
  );
}
