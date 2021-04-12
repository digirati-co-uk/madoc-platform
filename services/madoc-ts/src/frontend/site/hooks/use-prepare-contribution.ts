import { useMutation } from 'react-query';
import { useApi } from '../../shared/hooks/use-api';
import { useData } from '../../shared/hooks/use-data';
import { CanvasLoader } from '../pages/loaders/canvas-loader';
import { ManifestLoader } from '../pages/loaders/manifest-loader';
import { useCanvasUserTasks } from './use-canvas-user-tasks';
import { useManifestUserTasks } from './use-manifest-user-tasks';
import { useRouteContext } from './use-route-context';

export function usePrepareContribution() {
  const { projectId, manifestId, collectionId, canvasId } = useRouteContext();
  const { refetch: refetchCanvas } = useData(CanvasLoader, undefined, { enabled: !!canvasId });
  const { refetch: refetchManifest } = useData(ManifestLoader, undefined, { enabled: !!manifestId });
  const { refetch: refetchManifestTasks } = useManifestUserTasks();
  const { refetch: refetchCanvasTasks } = useCanvasUserTasks();

  const api = useApi();

  return useMutation(async () => {
    if (projectId && canvasId) {
      await api.prepareResourceClaim(projectId, {
        canvasId,
        manifestId,
        collectionId,
      });

      await refetchCanvas();

      if (refetchManifestTasks) {
        await refetchManifestTasks();
      }
      if (refetchCanvasTasks) {
        await refetchCanvasTasks();
      }
      if (refetchManifest) {
        await refetchManifest();
      }
    }
  });
}
