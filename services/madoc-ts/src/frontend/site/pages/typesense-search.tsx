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
import styled from 'styled-components';
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

const SearchLayout = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
`;

const Sidebar = styled.aside`
  width: 19rem;
  max-height: calc(100vh - 11rem);
  overflow-y: auto;
  padding-right: 0.8rem;
`;

const SearchMain = styled.main`
  flex: 1 1 0;
  min-width: 0;
`;

const HitsContainer = styled.div`
  .ais-Hits-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: 1rem;
  }

  .ais-Hits-item {
    display: flex;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    box-shadow: none;
    background: transparent;
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 1px solid #d8d8d8;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #fff;
`;

const CardImage = styled.img`
  width: 100%;
  height: 12rem;
  object-fit: cover;
  display: block;
  background: #f4f4f4;
`;

const CardImagePlaceholder = styled.div`
  width: 100%;
  height: 12rem;
  display: block;
  background: #f4f4f4;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  padding: 0.8rem;
`;

const Badge = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #444;
  background: #efefef;
  border-radius: 0.3rem;
  padding: 0.2rem 0.5rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  margin-bottom: 0.4rem;
  font-size: 1rem;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`;

const CardIdentifier = styled.div`
  font-size: 0.8rem;
  color: #555;
  margin-bottom: 0.6rem;
  word-break: break-word;
`;

const CardSnippet = styled.div`
  font-size: 0.85rem;
  color: #333;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  min-height: calc(1.35em * 3);
`;

const SearchInputContainer = styled.div`
  position: relative;
  margin-bottom: 0.6rem;
  max-width: 40rem;
`;

const SearchInput = styled.input`
  width: 100%;
  border: 1px solid #d0d7de;
  border-radius: 0.45rem;
  padding: 0.65rem 0.85rem;
  font-size: 0.95rem;
  outline: none;

  &:focus {
    border-color: #1f6feb;
    box-shadow: 0 0 0 2px rgba(31, 111, 235, 0.16);
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: calc(100% + 0.3rem);
  left: 0;
  right: 0;
  max-height: 18rem;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid #d0d7de;
  border-radius: 0.45rem;
  background: #fff;
  z-index: 25;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
`;

const SuggestionButton = styled.button`
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #eef2f7;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: 0;
  }
`;

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
    <SearchInputContainer>
      <SearchInput
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
        <SuggestionsList>
          {isLoadingSuggestions && suggestions.length === 0 ? <li style={{ padding: '0.55rem 0.75rem' }}>Loading suggestions...</li> : null}
          {!isLoadingSuggestions && suggestions.length === 0 ? <li style={{ padding: '0.55rem 0.75rem' }}>No suggestions</li> : null}
          {suggestions.map(suggestion => (
            <li key={suggestion.resource_id || `${suggestion.resource_type}-${suggestion.resource_label || 'result'}`}>
              <SuggestionButton
                type="button"
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
              </SuggestionButton>
            </li>
          ))}
        </SuggestionsList>
      ) : null}
    </SearchInputContainer>
  );
};

const HitCard: React.FC<{ hit: any }> = ({ hit }) => {
  const primaryLink = resolveTypesenseHitPrimaryLink(hit);

  return (
    <Card>
      {hit.thumbnail ? (
        <CardImage src={hit.thumbnail} alt={hit.resource_label || 'Search result thumbnail'} />
      ) : (
        <CardImagePlaceholder />
      )}
      <CardBody>
        <div style={{ marginBottom: '0.5rem' }}>
          <Badge>{hit.resource_type || 'resource'}</Badge>
        </div>
        <CardTitle>
          {primaryLink ? (
            <HrefLink href={primaryLink} style={{ color: '#1b4fd6', textDecoration: 'none' }}>
              <Highlight hit={hit as any} attribute="resource_label" />
            </HrefLink>
          ) : (
            <Highlight hit={hit as any} attribute="resource_label" />
          )}
        </CardTitle>

        <CardIdentifier>{hit.resource_id}</CardIdentifier>

        <CardSnippet>
          <Highlight hit={hit as any} attribute="search_text" />
        </CardSnippet>
      </CardBody>
    </Card>
  );
};

export const TypesenseSearch: React.FC = () => {
  const site = useSite();
  const node = useMemo(() => getNodeConfig(site.slug), [site.slug]);
  const { data, isLoading, error } = useQuery<TypesenseStatus>(['site-typesense-search-status', site.slug], async () => {
    const response = await fetch(`/s/${site.slug}/madoc/api/typesense/status`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }
    return response.json();
  });
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
      <InstantSearch searchClient={adapter.searchClient} indexName={data.collection} routing={true}>
        <SearchDefaults />
        <SearchInputWithAutocomplete />
        <SearchModeHint />
        <Stats />
        <SearchLayout>
          <Sidebar>
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
          </Sidebar>
          <SearchMain>
            <div style={{ margin: '0.8rem 0', display: 'flex', justifyContent: 'center' }}>
              <Pagination />
            </div>
            <HitsContainer>
              <Hits hitComponent={HitCard} />
            </HitsContainer>
            <div style={{ margin: '0.8rem 0', display: 'flex', justifyContent: 'center' }}>
              <Pagination />
            </div>
          </SearchMain>
        </SearchLayout>
      </InstantSearch>
    </>
  );
};
