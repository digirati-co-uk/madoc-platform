import { RevisionRequest } from '@capture-models/types';
import { useMutation } from 'react-query';
import { useDeselectRevision } from '../../shared/caputre-models/new/hooks/use-deselect-revision';
import { useRevisionList } from '../../shared/caputre-models/new/hooks/use-revision-list';
import { useApi } from '../../shared/hooks/use-api';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { useData } from '../../shared/hooks/use-data';
import { useViewerSaving } from '../../shared/hooks/use-viewer-saving';
import { ManifestLoader } from '../pages/loaders/manifest-loader';
import { useCanvasUserTasks } from './use-canvas-user-tasks';
import { useManifestTask } from './use-manifest-task';
import { useManifestUserTasks } from './use-manifest-user-tasks';
import { useRouteContext } from './use-route-context';

export const useSubmitAllClaims = () => {
  const { projectId, manifestId, collectionId, canvasId } = useRouteContext();
  const api = useApi();
  const { refetch: refetchManifest } = useData(ManifestLoader, undefined, { enabled: !!manifestId });
  const { refetch: refetchManifestTasks } = useManifestUserTasks();
  const { refetch: refetchCanvasTasks } = useCanvasUserTasks();
  const { refetch: refetchManifestTask } = useManifestTask();
  const deselectRevision = useDeselectRevision();
  const { refetch } = apiHooks.getSiteProjectCanvasTasks(() =>
    projectId && canvasId ? [projectId, canvasId] : undefined
  );
  const afterSave = async (response: RevisionRequest) => {
    if (projectId) {
      await api.createResourceClaim(projectId, {
        revisionId: response.revision.id,
        manifestId,
        canvasId,
        collectionId,
        status: 2,
      });
      await refetch();
      if (manifestId) {
        await refetchManifest();
        await refetchManifestTasks();
        await refetchCanvasTasks();
        await refetchManifestTask();
      }
    }
  };
  const updateFunction = useViewerSaving(afterSave);
  const { myUnpublished } = useRevisionList();
  const [submitAllClaims, { isLoading }] = useMutation(async () => {
    if (projectId && manifestId) {
      for (const response of myUnpublished) {
        await updateFunction(response, 'submitted');
      }
    }
    deselectRevision();
  });

  return {
    submitAllClaims,
    isSubmitting: isLoading,
    canSubmit: myUnpublished.length !== 0,
  };
};
