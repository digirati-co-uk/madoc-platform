import { useApi } from '../../shared/hooks/use-api';
import { useRouteContext } from './use-route-context';
import { useQuery } from 'react-query';

export function useProjectAssigneeStats() {
  const api = useApi();
  const { projectId } = useRouteContext();

  const assigneeStats = useQuery(['project-task-stats', { projectId }], async () => {
    if (projectId) {
      return api.listProjectAssigneeStats(projectId);
    }
  });

  return assigneeStats;
}
