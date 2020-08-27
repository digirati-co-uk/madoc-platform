import { useApi } from './use-api';
import { useQuery } from 'react-query';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { ProjectListItem } from '../../../types/schemas/project-list-item';
import { ProjectFull } from '../../../types/schemas/project-full';

export function useProjectByTask(task: BaseTask): ProjectFull | undefined {
  const api = useApi();

  const { data } = useQuery(
    ['project-by-task', { taskId: task.root_task }],
    async () => {
      if (!task.root_task) {
        return undefined;
      }

      const projects = await api.getProjects(0, { root_task_id: task.root_task });

      if (!projects || projects.pagination.totalResults === 0) {
        return undefined;
      }

      return await api.getProject(projects.projects[0].id);
    },
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchIntervalInBackground: false,
    }
  );

  return data;
}
