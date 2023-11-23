import { useMutation } from 'react-query';
import { useApi } from '../../shared/hooks/use-api';
import { useUser } from '../../shared/hooks/use-site';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useManifestTask } from './use-manifest-task';
import { useModelPageConfiguration } from './use-model-page-configuration';
import { useRouteContext } from './use-route-context';

export function useClaimManifest() {
  const { projectId, manifestId } = useRouteContext();
  const {
    isManifestComplete,
    isFetched: manifestTaskFetched,
    userTasks,
    manifestTask,
    refetch,
    canClaimManifest,
  } = useManifestTask();
  const config = useSiteConfiguration();
  const { preventContributionAfterManifestUnassign } = useModelPageConfiguration();
  const api = useApi();
  const user = useUser();
  const validManifestTask = (userTasks || []).find(task =>
    preventContributionAfterManifestUnassign ? task.status !== -1 : task
  );
  const doesUserHaveManifestClaim = !!manifestTask;
  const isManifestClaimRequired =
    manifestId && config.project.claimGranularity === 'manifest' && !doesUserHaveManifestClaim;

  const [claim, { isLoading, isError }] = useMutation(async () => {
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
    didError: isError,
    isClaimed: doesUserHaveManifestClaim,
    isClaimLoading: isLoading,
    canClaim: projectId && manifestId && !isManifestComplete && canClaimManifest, // @todo IS manifest at capacity?
    shouldAutoClaim: !isLoading && canClaimManifest && manifestTaskFetched && isManifestClaimRequired,
  };
}
