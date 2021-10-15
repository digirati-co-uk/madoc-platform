import { useMutation } from 'react-query';
import { useApi } from '../../shared/hooks/use-api';
import { useData } from '../../shared/hooks/use-data';
import { CanvasLoader } from '../pages/loaders/canvas-loader';
import { ManifestLoader } from '../pages/loaders/manifest-loader';
import { useProjectCanvasTasks } from './use-project-canvas-tasks';
import { useProjectManifestTasks } from './use-project-manifest-tasks';
import { useRouteContext } from './use-route-context';

export function usePrepareContribution() {
  const { projectId, manifestId, collectionId, canvasId } = useRouteContext();
  const { refetch: refetchCanvas } = useData(CanvasLoader, undefined, { enabled: !!canvasId });
  const { refetch: refetchManifest } = useData(ManifestLoader, undefined, { enabled: !!manifestId });
  const { refetch: refetchManifestTasks } = useProjectManifestTasks();
  const { refetch: refetchCanvasTasks } = useProjectCanvasTasks();

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
