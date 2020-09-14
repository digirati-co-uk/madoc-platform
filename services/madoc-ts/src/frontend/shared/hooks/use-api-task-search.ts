import { useQuery } from 'react-query';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { useApi } from './use-api';

export function useApiTaskSearch<Task extends BaseTask = BaseTask>(
  query: {
    all?: boolean;
    all_tasks?: boolean;
    status?: number | number[];
    root_task_id?: string;
    parent_task_id?: string;
    subject_parent?: string;
    subject?: string;
    type?: string;
    detail?: boolean;
  },
  {
    page = 0,
    enabled = true,
  }: {
    page?: number;
    enabled?: boolean;
  } = { page: 0, enabled: true }
) {
  const api = useApi();
  return useQuery(
    ['api-task-search', query],
    async () => {
      return api.getTasks<Task>(page, query);
    },
    { enabled }
  );
}
