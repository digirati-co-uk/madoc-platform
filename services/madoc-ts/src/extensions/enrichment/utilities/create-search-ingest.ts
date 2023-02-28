import { EnrichmentIndexPayload } from '../types';

export function createSearchIngest(
  resourceId: number,
  type: 'manifest' | 'canvas' | 'collection',
  manifest: any,
  site_id: number,
  thumbnail?: string | null,
  contexts: string[] = []
): EnrichmentIndexPayload {
  return {
    madoc_id: `urn:madoc:${type}:${resourceId}`,
    type: type,
    label: manifest.label,
    madoc_url: `http://madoc.dev/urn:madoc:${type}:${resourceId}`,
    iiif_json: manifest,
    thumbnail: manifest.thumbnail,
    contexts: [`urn:madoc:site:${site_id}`, ...contexts, `urn:madoc:${type}:${resourceId}`],
  };
}
