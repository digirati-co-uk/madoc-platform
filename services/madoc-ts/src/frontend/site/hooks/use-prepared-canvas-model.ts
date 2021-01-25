import { useEffect, useState } from 'react';
import { useCanvasModel } from './use-canvas-model';
import { usePrepareContribution } from './use-prepare-contribution';
import { useRouteContext } from './use-route-context';

export function usePreparedCanvasModel() {
  const { canvasId } = useRouteContext();
  const [hasPrepared, setHasPrepared] = useState(false);
  const modelResponse = useCanvasModel();

  const [prepare, { isLoading }] = usePrepareContribution();

  const model = modelResponse.data?.model;
  const isFetched = modelResponse.isFetched;
  const preparationFailed = hasPrepared && !model;
  const isPreparing = isLoading;
  const shouldAutoPrepare = true; // config.

  useEffect(() => {
    if (canvasId) {
      setHasPrepared(false);
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
