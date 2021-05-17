import { useCallback } from 'react';
import { useCollection } from './use-collection';
import { useManifest } from './use-manifest';
import { useProject } from './use-project';
import { useProjectCanvasTasks } from './use-project-canvas-tasks';
import { useProjectManifestTasks } from './use-project-manifest-tasks';

/**
 * Whenever a contribution is made, some resources will need to be refetched. They are found here.
 */
export function useInvalidateAfterSubmission() {
  const getSiteProject = useProject();
  const getSiteManifest = useManifest();
  const getSiteCollection = useCollection();
  const getSiteProjectCanvasTasks = useProjectCanvasTasks();
  const getSiteProjectManifestTasks = useProjectManifestTasks();

  return useCallback(async () => {
    await Promise.all([
      getSiteProject.refetch(),
      getSiteManifest.refetch(),
      getSiteCollection.refetch(),
      getSiteProjectCanvasTasks.refetch(),
      getSiteProjectManifestTasks.refetch(),
    ]);
  }, [getSiteCollection, getSiteManifest, getSiteProject, getSiteProjectCanvasTasks, getSiteProjectManifestTasks]);
}
