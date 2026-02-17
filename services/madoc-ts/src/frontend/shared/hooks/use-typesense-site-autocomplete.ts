import { useQuery } from 'react-query';
import { useSite } from './use-site';

export type TypesenseAutocompleteHit = {
  resource_type?: string;
  resource_label?: string;
  resource_id?: string;
  manifest_id?: string;
  contexts?: string[];
  thumbnail?: string;
};

type TypesenseStatus = {
  available: boolean;
  collection: string;
  reason?: string;
};

function getMadocUrnId(urn: string | undefined, type: string): string | null {
  if (!urn || typeof urn !== 'string') {
    return null;
  }

  const match = urn.match(new RegExp(`^urn:madoc:${type}:(\\d+)$`, 'i'));
  return match ? match[1] : null;
}

export function resolveTypesenseHitPrimaryLink(hit: TypesenseAutocompleteHit): string | null {
  const isManifest = `${hit.resource_type || ''}`.toLowerCase() === 'manifest';
  const isCanvas = `${hit.resource_type || ''}`.toLowerCase() === 'canvas';

  const manifestId = isManifest
    ? getMadocUrnId(hit.resource_id, 'manifest')
    : getMadocUrnId(hit.manifest_id, 'manifest');
  const canvasId = isCanvas ? getMadocUrnId(hit.resource_id, 'canvas') : null;
  const collectionIds = Array.isArray(hit.contexts)
    ? hit.contexts.map(context => getMadocUrnId(context, 'collection')).filter(Boolean)
    : [];

  if (canvasId && manifestId) {
    return `/manifests/${manifestId}/c/${canvasId}`;
  }

  if (manifestId) {
    return `/manifests/${manifestId}`;
  }

  if (collectionIds[0]) {
    return `/collections/${collectionIds[0]}`;
  }

  return null;
}

export function useTypesenseSiteAutocomplete(
  rawQuery: string,
  { enabled = true, limit = 6 }: { enabled?: boolean; limit?: number } = {}
) {
  const site = useSite();
  const query = rawQuery.trim();

  const statusQuery = useQuery<TypesenseStatus>(
    ['site-typesense-search-status', site.slug],
    async () => {
      const response = await fetch(`/s/${site.slug}/madoc/api/typesense/status`, { credentials: 'include' });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      return response.json();
    },
    {
      enabled: enabled && !!site.slug,
      staleTime: 15000,
      retry: false,
    }
  );

  const suggestionsQuery = useQuery<TypesenseAutocompleteHit[]>(
    ['typesense-site-autocomplete', site.slug, query, limit],
    async () => {
      const response = await fetch(`/s/${site.slug}/madoc/api/typesense`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          query_by: 'resource_label,search_text',
          per_page: limit,
          page: 1,
        }),
      });

      if (!response.ok) {
        return [];
      }

      const body = await response.json();
      const hits = Array.isArray(body?.hits) ? body.hits : [];
      const seen = new Set<string>();
      const suggestions: TypesenseAutocompleteHit[] = [];

      for (const hit of hits) {
        const document = hit?.document || hit;
        if (!document || typeof document !== 'object') {
          continue;
        }
        const resourceId = typeof document.resource_id === 'string' ? document.resource_id : undefined;
        if (!resourceId || seen.has(resourceId)) {
          continue;
        }
        seen.add(resourceId);
        suggestions.push(document as TypesenseAutocompleteHit);
      }

      return suggestions;
    },
    {
      enabled: enabled && !!site.slug && !!statusQuery.data?.available && query.length > 1,
      keepPreviousData: true,
      retry: false,
    }
  );

  return {
    available: !!statusQuery.data?.available,
    reason: statusQuery.data?.reason,
    isCheckingAvailability: statusQuery.isLoading,
    suggestions: suggestionsQuery.data || [],
    isLoadingSuggestions: suggestionsQuery.isLoading,
  };
}
