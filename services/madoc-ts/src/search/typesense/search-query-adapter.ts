import { SearchQuery, SearchResponse, SearchResult } from '../../types/search';
import { parseUrn } from '../../utility/parse-urn';
import { getTypesenseSiteCollectionName, TypesenseClient } from './typesense-client';

type TypesenseFacetCount = {
  count: number;
  value: string;
};

type TypesenseFacet = {
  field_name: string;
  counts: TypesenseFacetCount[];
};

type TypesenseSearchHit = {
  document: {
    resource_id: string;
    resource_type: string;
    resource_label?: string;
    thumbnail?: string | null;
    contexts?: string[];
    languages?: string[];
  };
  highlights?: Array<{
    field: string;
    snippet?: string;
    value?: string;
  }>;
  highlight?: {
    [field: string]: {
      snippet?: string;
      value?: string;
    };
  };
  text_match?: number;
};

type TypesenseSearchResult = {
  hits?: TypesenseSearchHit[];
  found?: number;
  page?: number;
  out_of?: number;
  facet_counts?: TypesenseFacet[];
};

function quoteFilterValue(value: string) {
  return `\`${value.replace(/`/g, '\\`')}\``;
}

function normalizeResourceType(value?: string) {
  if (!value) {
    return undefined;
  }

  if (value.length <= 1) {
    return value.toUpperCase();
  }

  return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
}

function getSnippetFromHit(hit: TypesenseSearchHit) {
  const highlight = hit.highlights && hit.highlights.length ? hit.highlights[0] : undefined;
  if (highlight && (highlight.snippet || highlight.value)) {
    return highlight.snippet || highlight.value || '';
  }

  if (hit.highlight) {
    const byField = hit.highlight.search_text || hit.highlight.resource_label;
    if (byField && (byField.snippet || byField.value)) {
      return byField.snippet || byField.value || '';
    }
  }

  return '';
}

function mapHitToResult(hit: TypesenseSearchHit): SearchResult {
  const document = hit.document;
  const label = document.resource_label || 'Untitled';
  const contexts = Array.isArray(document.contexts) ? document.contexts : [];

  return {
    url: document.resource_id,
    resource_id: document.resource_id,
    resource_type: document.resource_type,
    madoc_thumbnail: document.thumbnail || undefined,
    label: { none: [label] },
    contexts: contexts
      .map(contextId => {
        const parsed = parseUrn<{ id: number; type: string }>(contextId);
        return {
          id: contextId,
          type: parsed ? parsed.type : 'unknown',
        };
      })
      .filter(Boolean),
    hits: [
      {
        type: 'metadata',
        subtype: 'fulltext',
        snippet: getSnippetFromHit(hit),
        language: document.languages && document.languages.length ? document.languages[0] : 'none',
        rank: hit.text_match || 0,
      },
    ],
  };
}

function addMetadataFacetValue(
  facets: Record<string, any>,
  key: string,
  value: string,
  count: number
) {
  if (!facets.metadata) {
    facets.metadata = {};
  }
  if (!facets.metadata[key]) {
    facets.metadata[key] = {};
  }
  facets.metadata[key][value] = (facets.metadata[key][value] || 0) + count;
}

function mapFacetCounts(
  facetCounts: TypesenseFacet[] | undefined,
  query: SearchQuery
): Record<string, any> {
  if (!facetCounts || !facetCounts.length) {
    return {};
  }

  const requestedFields = new Set((query.facet_fields || []).map(field => field.toLowerCase()));
  const facets: Record<string, any> = {};

  const metadataFacet = facetCounts.find(facet => facet.field_name === 'metadata_pairs');
  if (!metadataFacet) {
    return facets;
  }

  for (const item of metadataFacet.counts || []) {
    const value = item.value || '';
    const separator = value.indexOf(':');
    if (separator <= 0) {
      continue;
    }

    const rawKey = value.slice(0, separator).toLowerCase();
    const key = rawKey.includes('@') ? rawKey.split('@')[0] : rawKey;
    const metadataValue = value.slice(separator + 1);

    if (requestedFields.size && !requestedFields.has(key)) {
      continue;
    }

    addMetadataFacetValue(facets, key, metadataValue, item.count || 0);
  }

  return facets;
}

function buildFilterBy(query: SearchQuery, madocId?: string) {
  const filters: string[] = [];

  if (madocId) {
    filters.push(`resource_id:=${quoteFilterValue(madocId)}`);
  }

  if (query.contexts_all && query.contexts_all.length) {
    for (const contextId of query.contexts_all) {
      filters.push(`contexts:=${quoteFilterValue(contextId)}`);
    }
  }

  if (query.contexts && query.contexts.length) {
    const anyContext = query.contexts.map(contextId => `contexts:=${quoteFilterValue(contextId)}`).join(' || ');
    filters.push(`(${anyContext})`);
  }

  const explicitType = query.iiif_type || query.raw?.type__iexact;
  const resourceType = normalizeResourceType(explicitType);
  if (resourceType) {
    filters.push(`resource_type:=${quoteFilterValue(resourceType)}`);
  }

  if (query.facets && query.facets.length) {
    for (const facet of query.facets) {
      if (facet.type !== 'metadata') {
        continue;
      }
      if (!facet.subtype || typeof (facet as any).value === 'undefined') {
        continue;
      }

      const value = (facet as any).value;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        filters.push(`metadata_pairs:=${quoteFilterValue(`${facet.subtype.toLowerCase()}:${value}`)}`);
      }
    }
  }

  return filters.length ? filters.join(' && ') : undefined;
}

export async function queryTypesenseSearch({
  siteId,
  query,
  page = 1,
  madocId,
  perPage = 20,
}: {
  siteId: number;
  query: SearchQuery;
  page?: number;
  madocId?: string;
  perPage?: number;
}): Promise<SearchResponse> {
  const typesense = new TypesenseClient();
  const collectionName = getTypesenseSiteCollectionName(siteId);
  await typesense.ensureSearchCollection(collectionName);
  const filterBy = buildFilterBy(query, madocId);

  const q = query.fulltext && query.fulltext.trim().length ? query.fulltext.trim() : '*';
  const result = (await typesense.search(collectionName, {
    q,
    query_by: 'resource_label,search_text',
    page,
    per_page: perPage,
    filter_by: filterBy,
    facet_by: query.facet_fields && query.facet_fields.length ? 'metadata_pairs' : undefined,
    max_facet_values: 250,
    highlight_fields: 'resource_label,search_text',
    highlight_full_fields: 'resource_label,search_text',
  })) as TypesenseSearchResult;

  const hits = result.hits || [];
  const mappedResults = hits.map(mapHitToResult);
  const found = result.found || 0;

  return {
    results: mappedResults,
    facets: mapFacetCounts(result.facet_counts, query),
    pagination: {
      page: result.page || page,
      totalResults: found,
      totalPages: Math.max(1, Math.ceil(found / perPage)),
    },
  };
}
