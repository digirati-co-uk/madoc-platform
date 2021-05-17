import { useMemo } from 'react';
import { useProjectManifestTasks } from './use-project-manifest-tasks';

export function useManifestUserTasks() {
  const { data, isFetched, refetch } = useProjectManifestTasks();

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
