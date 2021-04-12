import { apiHooks } from '../../shared/hooks/use-api-query';
import { useRouteContext } from './use-route-context';

export function useManifestTask() {
  const { projectId, manifestId } = useRouteContext();
  const { data: projectTasks, refetch, isFetched } = apiHooks.getSiteProjectManifestTasks(
    () => (projectId && manifestId ? [projectId, manifestId] : undefined),
    {
      refetchOnMount: true,
    }
  );

  const manifestTask =
    projectTasks?.manifestTask?.type === 'crowdsourcing-manifest-task' ? projectTasks.manifestTask : undefined;

  const isManifestComplete = manifestTask?.status === 3;

  return {
    isFetched,
    manifestTask,
    isManifestComplete,
    totalContributors: projectTasks?.totalContributors,
    canUserSubmit: projectTasks?.canUserSubmit,
    refetch,
  };
}
