import { useEffect, useState } from 'react';
import { useCanvasModel } from './use-canvas-model';
import { useClaimManifest } from './use-claim-manifest';
import { useManifestTask } from './use-manifest-task';
import { usePrepareContribution } from './use-prepare-contribution';
import { useProjectStatus } from './use-project-status';
import { useRouteContext } from './use-route-context';

// Here we have 2 process
// Manifest Claim: [ Claim manifest ] -> [ Prepare canvas claim ] -> [ Claim canvas ]
// Canvas claim: [ prepare canvas claim ] -> [ Claim canvas ]

export function usePreparedCanvasModel() {
  const { canvasId } = useRouteContext();
  const [hasPrepared, setHasPrepared] = useState(false);
  const [hasPreparedManifest, setHasPreparedManifest] = useState(false);
  const [hasExpired, setHasExpired] = useState(false);
  const modelResponse = useCanvasModel();
  const { isManifestComplete, isFetched: manifestTaskFetched } = useManifestTask();
  const [prepare, { isLoading }] = usePrepareContribution();
  const projectStatus = useProjectStatus();

  const manifestClaim = useClaimManifest();

  const model = modelResponse.data?.model;
  const isFetched = modelResponse.isFetched && manifestTaskFetched;
  const preparationFailed = hasPrepared && !model;
  const isPreparing = isLoading;
  const shouldAutoPrepare = projectStatus.isPreparing || (!isManifestComplete && !manifestClaim.isClaimRequired); // @todo config.
  const canClaim = projectStatus.isActive && manifestClaim.shouldAutoClaim && !hasPreparedManifest && !hasExpired;
  const shouldPrepare = shouldAutoPrepare && !model && isFetched && !hasPrepared && !isLoading;

  useEffect(() => {
    if (canClaim) {
      manifestClaim
        .claim()
        .then(() => {
          // ... maybe refresh?
          setHasPreparedManifest(true);
        })
        .catch(() => {
          setHasExpired(true);
          setHasPreparedManifest(true); // @todo handle this error in a better way.
        });
    }
  }, [canClaim, manifestClaim]);

  useEffect(() => {
    if (canvasId) {
      setHasPrepared(false);
      setHasPreparedManifest(false);
    }
  }, [canvasId, modelResponse.data]);

  useEffect(() => {
    if (shouldPrepare) {
      prepare().then(async () => {
        await modelResponse.refetch();
        setHasPrepared(true);
      });
    }
  }, [modelResponse, prepare, shouldPrepare]);

  return {
    ...modelResponse,
    preparationFailed,
    hasExpired: manifestClaim.didError,
    hasPrepared,
    isPreparing,
  };
}
