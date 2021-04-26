import { useMutation } from 'react-query';
import { useApi } from '../../shared/hooks/use-api';
import { useUser } from '../../shared/hooks/use-site';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useManifestTask } from './use-manifest-task';
import { useRouteContext } from './use-route-context';

export function useClaimManifest() {
  const { projectId, manifestId } = useRouteContext();
  const { isManifestComplete, isFetched: manifestTaskFetched, userManifestTasks, refetch } = useManifestTask();
  const config = useSiteConfiguration();
  const api = useApi();
  const user = useUser();
  const validManifestTask = userManifestTasks.find(task => task.status !== -1);
  const doesUserHaveManifestClaim = !!validManifestTask;
  const isManifestClaimRequired =
    manifestId && config.project.claimGranularity === 'manifest' && !doesUserHaveManifestClaim;

  const [claim, { isLoading }] = useMutation(async () => {
    if (projectId && manifestId && user) {
      await api.createResourceClaim(projectId, {
        manifestId,
        status: 0, // since we have no canvases yet.
      });
      await refetch();
    }
  });

  return {
    claim,
    validManifestTask,
    isLoading: !manifestTaskFetched,
    isClaimRequired: isManifestClaimRequired,
    isClaimed: doesUserHaveManifestClaim,
    isClaimLoading: isLoading,
    canClaim: projectId && manifestId && !isManifestComplete, // @todo IS manifest at capacity?
    shouldAutoClaim: !isLoading && manifestTaskFetched && isManifestClaimRequired,
  };
}
