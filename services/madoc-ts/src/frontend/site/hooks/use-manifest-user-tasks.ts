import { useMemo } from 'react';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { useRouteContext } from './use-route-context';

export function useManifestUserTasks() {
  const { projectId, manifestId } = useRouteContext();
  const { data, isFetched, refetch } = apiHooks.getSiteProjectManifestTasks(
    () => (projectId && manifestId ? [projectId, manifestId] : undefined),
    {
      refetchOnMount: true,
    }
  );

  return useMemo(() => {
    const tasks = data?.userTasks || [];

    const inProgress = tasks.filter(task => task.status !== -1 && task.status !== 3);
    const doneTasks = tasks.filter(task => task.status === 3);
    const inReview = tasks.filter(task => task.status === 2);

    return {
      isFetched,
      inProgress,
      tasks,
      doneTasks,
      inReview,
      refetch,
    };
  }, [isFetched, refetch, data]);
}
