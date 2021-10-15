import { useMemo } from 'react';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { ProjectManifestTasks } from '../../../types/manifest-tasks';
import { useProjectManifestTasks } from './use-project-manifest-tasks';

export function useManifestTask(opts?: {
  refetchOnMount?: boolean;
}): ProjectManifestTasks & {
  filteredTasks: { inProgress: CrowdsourcingTask[]; done: CrowdsourcingTask[]; inReview: CrowdsourcingTask[] };
  isFetched: boolean;
  refetch: () => Promise<any>;
} {
  const { data: projectTasks, refetch, isFetched } = useProjectManifestTasks(opts);

  const {
    manifestTask,
    canClaimManifest,
    userManifestTask,
    userManifestStats,
    userTasks = [],
    totalContributors,
    canUserSubmit,
    maxContributors,
    hasExpired,
    isManifestComplete,
  } = projectTasks || {};

  const filteredTasks = useMemo(() => {
    const inProgress = userTasks.filter(task => task.status !== -1 && task.status !== 3);
    const done = userTasks.filter(task => task.status === 3);
    const inReview = userTasks.filter(task => task.status === 2);

    return {
      inProgress,
      done,
      inReview,
    };
  }, [userTasks]);

  return {
    isFetched,
    refetch,
    // From the server.
    manifestTask,
    userTasks: userTasks || [],
    maxContributors,
    isManifestComplete,
    totalContributors,
    canUserSubmit,
    canClaimManifest,
    userManifestTask,
    userManifestStats,
    hasExpired,

    // Derived.
    filteredTasks,
  };
}
