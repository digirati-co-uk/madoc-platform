import { useCallback } from 'react';
import { useQueryCache } from 'react-query';

/**
 * Whenever a contribution is made, some resources will need to be refetched. They are found here.
 */
export function useInvalidateAfterSubmission() {
  const queryCache = useQueryCache();

  return useCallback(async () => {
    await Promise.all([
      queryCache.invalidateQueries('getSiteProject'),
      queryCache.invalidateQueries('getSiteManifest'),
      queryCache.invalidateQueries('getSiteCollection'),
      queryCache.invalidateQueries('getSiteProjectCanvasTasks'),
      queryCache.invalidateQueries('getSiteProjectManifestTasks'),
    ]);
  }, []);
}
