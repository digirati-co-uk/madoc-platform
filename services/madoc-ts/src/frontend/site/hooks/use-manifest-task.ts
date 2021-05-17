import { useProjectManifestTasks } from './use-project-manifest-tasks';

export function useManifestTask() {
  const { data: projectTasks, refetch, isFetched } = useProjectManifestTasks();

  const manifestTask =
    projectTasks?.manifestTask?.type === 'crowdsourcing-manifest-task' ? projectTasks.manifestTask : undefined;

  const isManifestComplete = manifestTask?.status === 3;

  return {
    isFetched,
    manifestTask,
    userManifestTasks: projectTasks?.userTasks || [],
    isManifestComplete,
    totalContributors: projectTasks?.totalContributors,
    canUserSubmit: projectTasks?.canUserSubmit,
    canClaimManifest: projectTasks?.canClaimManifest,
    userManifestTask: projectTasks?.userManifestTask,
    userManifestStats: projectTasks?.userManifestStats,
    refetch,
  };
}
