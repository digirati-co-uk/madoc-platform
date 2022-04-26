import { useCallback } from 'react';
import { useCollection } from './use-collection';
import { useManifest } from './use-manifest';
import { useProject } from './use-project';
import { useProjectCanvasTasks } from './use-project-canvas-tasks';
import { useProjectManifestTasks } from './use-project-manifest-tasks';
import { useRouteContext } from './use-route-context';

/**
 * Whenever a contribution is made, some resources will need to be refetched. They are found here.
 */
export function useInvalidateAfterSubmission() {
  const { collectionId, projectId, manifestId, canvasId } = useRouteContext();
  const getSiteProject = useProject();
  const getSiteManifest = useManifest();
  const getSiteCollection = useCollection();
  const getSiteProjectCanvasTasks = useProjectCanvasTasks();
  const getSiteProjectManifestTasks = useProjectManifestTasks();

  return useCallback(async () => {
    await Promise.all([
      projectId ? getSiteProject.refetch() : null,
      manifestId ? getSiteManifest.refetch() : null,
      collectionId ? getSiteCollection.refetch() : null,
      projectId && canvasId ? getSiteProjectCanvasTasks.refetch() : null,
      projectId && manifestId ? getSiteProjectManifestTasks.refetch() : null,
    ]);
  }, [
    canvasId,
    collectionId,
    getSiteCollection,
    getSiteManifest,
    getSiteProject,
    getSiteProjectCanvasTasks,
    getSiteProjectManifestTasks,
    manifestId,
    projectId,
  ]);
}
