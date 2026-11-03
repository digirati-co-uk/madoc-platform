import type { QueryCache } from 'react-query';

const correctionQueryKeys = [
  'model-preview',
  'single-review',
  'all-review-tasks',
  'getCaptureModel',
  'getSiteProjectCanvasModel',
  'getSiteProjectManifestModel',
  'getSiteCanvasPublishedModels',
];

export async function markCorrectionQueriesStale(cache: Pick<QueryCache, 'invalidateQueries'>): Promise<void> {
  // React Query 2 hydrated queries can retain a placeholder queryFn until their observer first fetches.
  // Mark them stale here; the mounted model/review refetch callbacks supply the real loaders.
  await Promise.all(
    correctionQueryKeys.map(key => cache.invalidateQueries(key, { refetchActive: false, refetchInactive: false }))
  );
}
