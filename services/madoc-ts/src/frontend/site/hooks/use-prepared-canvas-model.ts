import { useEffect, useState } from 'react';
import { useCanvasModel } from './use-canvas-model';
import { useClaimManifest } from './use-claim-manifest';
import { useManifestTask } from './use-manifest-task';
import { usePrepareContribution } from './use-prepare-contribution';
import { useRouteContext } from './use-route-context';

// Here we have 2 process
// Manifest Claim: [ Claim manifest ] -> [ Prepare canvas claim ] -> [ Claim canvas ]
// Canvas claim: [ prepare canvas claim ] -> [ Claim canvas ]

export function usePreparedCanvasModel() {
  const { canvasId } = useRouteContext();
  const [hasPrepared, setHasPrepared] = useState(false);
  const [hasPreparedManifest, setHasPreparedManifest] = useState(false);
  const modelResponse = useCanvasModel();
  const { isManifestComplete, isFetched: manifestTaskFetched } = useManifestTask();
  const [prepare, { isLoading }] = usePrepareContribution();

  const manifestClaim = useClaimManifest();

  const model = modelResponse.data?.model;
  const isFetched = modelResponse.isFetched && manifestTaskFetched;
  const preparationFailed = hasPrepared && !model;
  const isPreparing = isLoading;
  const shouldAutoPrepare = !isManifestComplete && !manifestClaim.isClaimRequired; // @todo config.

  // @todo This logic needs to change slightly.
  //   - Does the user have a manifest claim?
  //   - Is the user required to have a manifest claim?
  //   - Make claim if not and required.
  //   - Prevent other claim

  useEffect(() => {
    if (manifestClaim.shouldAutoClaim && !hasPreparedManifest) {
      manifestClaim
        .claim()
        .then(() => {
          // ... maybe refresh?
          setHasPreparedManifest(true);
        })
        .catch(() => {
          setHasPreparedManifest(true); // @todo handle this error in a better way.
        });
    }
  }, [
    manifestClaim,
    manifestClaim.isClaimLoading,
    manifestClaim.isClaimRequired,
    manifestClaim.isLoading,
    manifestTaskFetched,
  ]);

  useEffect(() => {
    if (canvasId) {
      setHasPrepared(false);
      setHasPreparedManifest(false);
    }
  }, [canvasId, modelResponse.data]);

  useEffect(() => {
    if (shouldAutoPrepare && !model && isFetched && !hasPrepared && !isLoading) {
      prepare().then(async () => {
        await modelResponse.refetch();
        setHasPrepared(true);
      });
    }
  }, [model, isFetched, prepare, hasPrepared, isLoading, shouldAutoPrepare, modelResponse]);

  return {
    ...modelResponse,
    preparationFailed,
    hasPrepared,
    isPreparing,
  };
}
