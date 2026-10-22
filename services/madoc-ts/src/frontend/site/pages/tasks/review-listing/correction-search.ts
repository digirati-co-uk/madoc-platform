import type { ApiClient } from '../../../../../gateway/api';
import type { CaptureModel } from '../../../../shared/capture-models/types/capture-model';

interface CorrectionIndexResponse {
  noSearch?: boolean;
  warnings?: string[];
  typesense?: {
    indexed: number;
    importResult: { failed: number; total: number };
  } | null;
}

/** Existing index endpoints also return HTTP 200 for failures and intentional skips. */
export async function refreshCorrectionSearch(api: Pick<ApiClient, 'request'>, model: CaptureModel): Promise<void> {
  const endpoints = new Set<string>();
  for (const target of model.target || []) {
    const match = /^urn:madoc:(canvas|manifest):([1-9]\d*)$/.exec(target.id);
    if (match) endpoints.add(`/api/madoc/iiif/${match[1] === 'canvas' ? 'canvases' : 'manifests'}/${match[2]}/index`);
  }
  // Try every affected resource even if one refresh fails.
  const results = await Promise.allSettled(
    [...endpoints].map(async endpoint => {
      const response = await api.request<CorrectionIndexResponse>(endpoint, { method: 'POST' });
      if (response.warnings?.length || (response.typesense?.importResult.failed || 0) > 0) {
        throw new Error('Search indexing failed.');
      }
      // Site disableSearchIndexing/unpublished resources return noSearch. A null
      // Typesense result without warnings is the endpoint's globally disabled case.
      if (response.noSearch || response.typesense === null) return;
      if (
        !response.typesense ||
        response.typesense.importResult.failed !== 0 ||
        response.typesense.indexed !== response.typesense.importResult.total
      ) {
        throw new Error('Search indexing did not complete.');
      }
    })
  );
  if (results.some(result => result.status === 'rejected')) throw new Error('Search could not refresh.');
}

export interface CorrectionSaveResult {
  saved: true;
  searchRefreshed: boolean;
}

/** Once persist resolves, search failure must never be reported as a failed write. */
export async function persistAndRefreshCorrection(input: {
  persist: () => Promise<CaptureModel>;
  refreshSearch: (model: CaptureModel) => Promise<void>;
  onPersisted: (model: CaptureModel) => void;
}): Promise<CorrectionSaveResult> {
  const model = await input.persist();
  input.onPersisted(model);
  try {
    await input.refreshSearch(model);
    return { saved: true, searchRefreshed: true };
  } catch {
    return { saved: true, searchRefreshed: false };
  }
}
