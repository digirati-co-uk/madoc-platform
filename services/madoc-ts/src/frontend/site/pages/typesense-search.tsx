import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  Stats,
  useSearchBox,
} from 'react-instantsearch';
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import { DisplayBreadcrumbs } from '../blocks/Breadcrumbs';
import { LoadingBlock } from '../../shared/callouts/LoadingBlock';
import { HrefLink } from '../../shared/utility/href-link';
import { useSite } from '../../shared/hooks/use-site';
import {
  resolveTypesenseHitPrimaryLink,
  useTypesenseSiteAutocomplete,
} from '../../shared/hooks/use-typesense-site-autocomplete';
import { Search as LegacySearch } from './search';
import 'instantsearch.css/themes/satellite-min.css';

type TypesenseStatus = {
  available: boolean;
  collection: string;
  reason?: string;
};

type TypesenseFacetCount = {
  value: string;
};

type TypesenseFacet = {
  field_name: string;
  counts: TypesenseFacetCount[];
};

type MetadataFacet = {
  attribute: string;
  label: string;
};

type SearchRouteState = {
  fulltext?: string | string[];
  page?: string | string[];
  refinements?: string | string[];
};

type SearchPageUiState = {
  query?: string;
  page?: number;
  refinementList?: Record<string, string[]>;
};

function getSingleValue(value?: string | string[]) {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0];
  }

  return undefined;
}

function parseRoutePage(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 1 ? parsed : undefined;
}

function parseRouteRefinements(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return undefined;
    }

    const refinementList = Object.entries(parsed).reduce<Record<string, string[]>>((acc, [key, values]) => {
      if (!Array.isArray(values)) {
        return acc;
      }

      const normalizedValues = values.filter((item): item is string => typeof item === 'string');
      if (!normalizedValues.length) {
        return acc;
      }

      acc[key] = normalizedValues;
      return acc;
    }, {});

    return Object.keys(refinementList).length ? refinementList : undefined;
  } catch {
    return undefined;
  }
}

function shouldFallbackToLegacy(reason?: string) {
  return reason === 'Typesense search is disabled' || reason === 'Typesense search is not configured';
}

function getNodeConfig(slug?: string) {
  if (typeof window === 'undefined' || !slug) {
    return null;
  }

  return {
    host: window.location.hostname,
    port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80'),
    protocol: window.location.protocol.replace(':', ''),
    path: `/s/${slug}/madoc/api/typesense`,
  };
}

function metadataFacetLabelFromAttribute(attribute: string) {
  return attribute
    .replace(/^metadata_/, '')
    .replace(/_/g, ' ')
    .trim();
}

const SearchDefaults: React.FC = () => {
  const { query } = useSearchBox();
  const hasQuery = !!query.trim();

  return (
    <Configure
      hitsPerPage={24}
      query_by="resource_label,search_text"
      filter_by={hasQuery ? undefined : 'resource_type:=Manifest'}
    />
  );
};

const SearchModeHint: React.FC = () => {
  const { query } = useSearchBox();
  const hasQuery = !!query.trim();

  return hasQuery ? (
    <p style={{ margin: '0.5rem 0 1rem', color: '#555' }}>Searching all indexed resource types.</p>
  ) : (
    <p style={{ margin: '0.5rem 0 1rem', color: '#555' }}>
      Showing manifests by default. Start typing to include canvases and other resources.
    </p>
  );
};

const SearchInputWithAutocomplete: React.FC = () => {
  const [focused, setFocused] = useState(false);
  const { query, refine } = useSearchBox();
  const { available, suggestions, isLoadingSuggestions } = useTypesenseSiteAutocomplete(query, {
    enabled: true,
    limit: 8,
  });
  const showSuggestions = available && focused && query.trim().length > 1;

  return (
    <div className="relative mb-2 max-w-[40rem]">
      <input
        className="w-full rounded-[0.45rem] border border-slate-300 px-3.5 py-2.5 text-[0.95rem] outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
        type="search"
        value={query}
        placeholder="Search manifests and canvases"
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setTimeout(() => setFocused(false), 100);
        }}
        onChange={event => {
          refine(event.target.value);
        }}
      />
      {showSuggestions ? (
        <ul className="absolute left-0 right-0 top-[calc(100%+0.3rem)] z-20 m-0 max-h-72 list-none overflow-y-auto rounded-[0.45rem] border border-slate-300 bg-white p-0 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
          {isLoadingSuggestions && suggestions.length === 0 ? (
            <li className="px-3 py-2">Loading suggestions...</li>
          ) : null}
          {!isLoadingSuggestions && suggestions.length === 0 ? <li className="px-3 py-2">No suggestions</li> : null}
          {suggestions.map(suggestion => (
            <li key={suggestion.resource_id || `${suggestion.resource_type}-${suggestion.resource_label || 'result'}`}>
              <button
                type="button"
                className="w-full border-0 border-b border-slate-100 bg-transparent px-3 py-2 text-left last:border-b-0 hover:bg-slate-50"
                onMouseDown={event => {
                  event.preventDefault();
                  refine(suggestion.resource_label || suggestion.resource_id || query);
                  setFocused(false);
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1f2937' }}>
                  {suggestion.resource_label || 'Untitled'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {suggestion.resource_type || 'Resource'}
                  {suggestion.resource_id ? ` | ${suggestion.resource_id}` : ''}
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

const HitCard: React.FC<{ hit: any }> = ({ hit }) => {
  const primaryLink = resolveTypesenseHitPrimaryLink(hit);

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-slate-300 bg-white">
      {hit.thumbnail ? (
        <img
          className="block h-48 w-full bg-slate-100 object-cover"
          src={hit.thumbnail}
          alt={hit.resource_label || 'Search result thumbnail'}
        />
      ) : (
        <div className="block h-48 w-full bg-slate-100" />
      )}
      <div className="flex flex-1 flex-col p-3">
        <div style={{ marginBottom: '0.5rem' }}>
          <span className="inline-block rounded bg-slate-100 px-2 py-1 text-xs uppercase tracking-[0.02em] text-slate-700">
            {hit.resource_type || 'resource'}
          </span>
        </div>
        <h3
          className="mb-1.5 text-base leading-[1.35]"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {primaryLink ? (
            <HrefLink href={primaryLink} style={{ color: '#1b4fd6', textDecoration: 'none' }}>
              <Highlight hit={hit as any} attribute="resource_label" />
            </HrefLink>
          ) : (
            <Highlight hit={hit as any} attribute="resource_label" />
          )}
        </h3>

        <div className="mb-2 break-words text-[0.8rem] text-slate-600">{hit.resource_id}</div>

        <div
          className="min-h-[calc(1.35em*3)] text-[0.85rem] leading-[1.35] text-slate-800"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
          }}
        >
          <Highlight hit={hit as any} attribute="search_text" />
        </div>
      </div>
    </article>
  );
};

export const TypesenseSearch: React.FC = () => {
  const site = useSite();
  const node = useMemo(() => getNodeConfig(site.slug), [site.slug]);
  const { data, isLoading, error } = useQuery<TypesenseStatus>(
    ['site-typesense-search-status', site.slug],
    async () => {
      const response = await fetch(`/s/${site.slug}/madoc/api/typesense/status`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }
      return response.json();
    }
  );
  const {
    data: metadataFacets = [],
    isLoading: metadataFacetsLoading,
    error: metadataFacetsError,
  } = useQuery<MetadataFacet[]>(
    ['site-typesense-search-metadata-facets', site.slug, data?.collection],
    async () => {
      const response = await fetch(`/s/${site.slug}/madoc/api/typesense`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: '*',
          query_by: 'resource_label,search_text',
          per_page: 0,
          facet_by: 'metadata_*',
          max_facet_values: 25,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      const body = await response.json();
      const allFacets = Array.isArray(body?.facet_counts) ? (body.facet_counts as TypesenseFacet[]) : [];
      return allFacets
        .filter(facet => {
          if (!facet || typeof facet.field_name !== 'string') {
            return false;
          }
          if (!facet.field_name.startsWith('metadata_')) {
            return false;
          }
          if (facet.field_name === 'metadata_keys' || facet.field_name === 'metadata_pairs') {
            return false;
          }
          return Array.isArray(facet.counts) && facet.counts.length > 0;
        })
        .map(facet => ({ attribute: facet.field_name, label: metadataFacetLabelFromAttribute(facet.field_name) }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    {
      enabled: !!data?.available && !!site.slug,
    }
  );

  const adapter = useMemo(() => {
    if (!data?.available || !node) {
      return null;
    }

    return new TypesenseInstantSearchAdapter({
      server: {
        apiKey: 'madoc-typesense-proxy',
        nodes: [node],
        cacheSearchResultsForSeconds: 0,
      },
      additionalSearchParameters: {
        query_by: 'resource_label,search_text',
      },
    });
  }, [data?.available, node]);
  const routing = useMemo(() => {
    if (!data?.collection) {
      return undefined;
    }

    return {
      stateMapping: {
        stateToRoute(uiState: Record<string, SearchPageUiState | undefined>): SearchRouteState {
          const indexUiState = uiState[data.collection];
          const refinements =
            indexUiState?.refinementList && Object.keys(indexUiState.refinementList).length
              ? JSON.stringify(indexUiState.refinementList)
              : undefined;

          return {
            fulltext: indexUiState?.query || undefined,
            page: indexUiState?.page && indexUiState.page > 1 ? String(indexUiState.page) : undefined,
            refinements,
          };
        },
        routeToState(routeState: SearchRouteState) {
          return {
            [data.collection]: {
              query: getSingleValue(routeState.fulltext) || '',
              page: parseRoutePage(getSingleValue(routeState.page)),
              refinementList: parseRouteRefinements(getSingleValue(routeState.refinements)),
            },
          };
        },
      },
    };
  }, [data?.collection]);

  if (isLoading) {
    return (
      <>
        <DisplayBreadcrumbs currentPage="Search" />
        <LoadingBlock />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <DisplayBreadcrumbs currentPage="Search" />
        <p>Failed to load Typesense search status.</p>
      </>
    );
  }

  if (!data.available && shouldFallbackToLegacy(data.reason)) {
    return <LegacySearch />;
  }

  if (!data.available || !adapter) {
    return (
      <>
        <DisplayBreadcrumbs currentPage="Search" />
        <p>Typesense search is unavailable: {data.reason || 'No reason provided'}.</p>
      </>
    );
  }

  return (
    <>
      <DisplayBreadcrumbs currentPage="Search" />
      <InstantSearch searchClient={adapter.searchClient} indexName={data.collection} routing={routing}>
        <SearchDefaults />
        <SearchInputWithAutocomplete />
        <SearchModeHint />
        <Stats />
        <div className="flex items-start gap-6">
          <aside className="max-h-[calc(100vh-11rem)] w-80 overflow-y-auto pr-3">
            <h4 style={{ marginTop: 0 }}>Type</h4>
            <RefinementList attribute="resource_type" />
            <h4>Metadata</h4>
            {metadataFacetsLoading ? <p>Loading metadata facets...</p> : null}
            {metadataFacetsError ? <p>Failed to load metadata facets.</p> : null}
            {metadataFacets.map(facet => (
              <div key={facet.attribute} style={{ marginBottom: '0.75rem' }}>
                <h5 style={{ margin: '0.3rem 0' }}>{facet.label}</h5>
                <RefinementList attribute={facet.attribute} />
              </div>
            ))}
          </aside>
          <main className="min-w-0 flex-1">
            <div style={{ margin: '0.8rem 0', display: 'flex', justifyContent: 'center' }}>
              <Pagination />
            </div>
            <Hits
              hitComponent={HitCard}
              classNames={{
                list: 'm-0 grid list-none grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4 p-0',
                item: 'm-0 flex h-full border-0 bg-transparent p-0 shadow-none',
              }}
            />
            <div style={{ margin: '0.8rem 0', display: 'flex', justifyContent: 'center' }}>
              <Pagination />
            </div>
          </main>
        </div>
      </InstantSearch>
    </>
  );
};
