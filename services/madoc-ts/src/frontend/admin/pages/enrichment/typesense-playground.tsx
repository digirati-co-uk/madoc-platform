import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  Stats,
} from 'react-instantsearch';
import { Link } from 'react-router-dom';
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import { WidePage } from '../../../shared/layout/WidePage';
import { AdminHeader } from '../../molecules/AdminHeader';
import { useSite } from '../../../shared/hooks/use-site';
import 'instantsearch.css/themes/satellite-min.css';

type TypesenseFacetCount = {
  value: string;
};

type TypesenseFacet = {
  field_name: string;
  counts: TypesenseFacetCount[];
};

type PlaygroundMetadataFacet = {
  attribute: string;
  label: string;
};

function metadataFacetLabelFromAttribute(attribute: string) {
  return attribute
    .replace(/^metadata_/, '')
    .replace(/_/g, ' ')
    .trim();
}

function getNodeConfig(slug?: string) {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!slug) {
    return null;
  }

  return {
    host: window.location.hostname,
    port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80'),
    protocol: window.location.protocol.replace(':', ''),
    path: `/s/${slug}/madoc/api/typesense`,
  };
}

function getMadocUrnId(urn: string | undefined, type: string): string | null {
  if (!urn || typeof urn !== 'string') {
    return null;
  }

  const match = urn.match(new RegExp(`^urn:madoc:${type}:(\\d+)$`, 'i'));
  return match ? match[1] : null;
}

function getCollectionIds(contexts: unknown): string[] {
  if (!Array.isArray(contexts)) {
    return [];
  }

  const ids = new Set<string>();
  for (const context of contexts) {
    if (typeof context !== 'string') {
      continue;
    }
    const id = getMadocUrnId(context, 'collection');
    if (id) {
      ids.add(id);
    }
  }
  return [...ids];
}

const Hit = ({ hit }: { hit: any }) => {
  const isManifest = `${hit.resource_type || ''}`.toLowerCase() === 'manifest';
  const isCanvas = `${hit.resource_type || ''}`.toLowerCase() === 'canvas';

  const manifestId = isManifest
    ? getMadocUrnId(hit.resource_id, 'manifest')
    : getMadocUrnId(hit.manifest_id, 'manifest');
  const canvasId = isCanvas ? getMadocUrnId(hit.resource_id, 'canvas') : null;
  const collectionIds = getCollectionIds(hit.contexts);

  const canvasLink =
    canvasId && manifestId ? `/manifests/${manifestId}/canvases/${canvasId}` : canvasId ? `/canvases/${canvasId}` : null;

  return (
    <article
      style={{
        borderBottom: '1px solid #dcdcdc',
        padding: '0.8rem 0',
      }}
    >
      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
        {hit.thumbnail ? (
          <img
            src={hit.thumbnail}
            alt={typeof hit.resource_label === 'string' ? hit.resource_label : 'Search result thumbnail'}
            style={{
              width: 96,
              height: 96,
              objectFit: 'cover',
              borderRadius: 4,
              border: '1px solid #e0e0e0',
            }}
          />
        ) : null}
        <div style={{ minWidth: 0, flex: 1 }}>
          <h4 style={{ margin: 0, marginBottom: '0.4rem' }}>
            <Highlight hit={hit} attribute="resource_label" />
          </h4>
          <div style={{ fontSize: '0.9rem', color: '#444' }}>
            {hit.resource_type} | {hit.resource_id}
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.4rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {manifestId ? <Link to={`/manifests/${manifestId}`}>Manifest</Link> : null}
            {canvasLink ? <Link to={canvasLink}>Canvas</Link> : null}
            {collectionIds.map(id => (
              <Link key={id} to={`/collections/${id}`}>
                Collection {id}
              </Link>
            ))}
          </div>
          {hit.search_text ? (
            <div style={{ marginTop: '0.4rem' }}>
              <Highlight hit={hit} attribute="search_text" />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export const TypesensePlaygroundPage: React.FC = () => {
  const site = useSite();
  const { data, isLoading, error } = useQuery(['typesense-playground-status'], async () => {
    const response = await fetch(`/s/${site.slug}/madoc/api/typesense/status`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }
    return response.json();
  });
  const {
    data: metadataFacets = [],
    isLoading: metadataFacetsLoading,
    error: metadataFacetsError,
  } = useQuery<PlaygroundMetadataFacet[]>(
    ['typesense-playground-metadata-facets', site.slug, data?.collection],
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

  const node = getNodeConfig(site.slug);
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

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Search indexing', link: `/enrichment/search-indexing` },
          { label: 'Typesense playground', active: true, link: `/enrichment/typesense-playground` },
        ]}
        title="Typesense playground"
        subtitle="Raw Typesense search UI for validating indexed content"
      />
      <WidePage>
        {isLoading ? <p>Loading Typesense status...</p> : null}
        {error ? <p>Failed to load Typesense status.</p> : null}
        {data && !data.available ? <p>Typesense unavailable: {data.reason || 'No reason provided'}.</p> : null}

        {data?.available && adapter ? (
          <InstantSearch searchClient={adapter.searchClient} indexName={data.collection} routing={true}>
            <Configure hitsPerPage={20} />
            <SearchBox placeholder="Search indexed content" />
            <div className="my-3">
              <Stats />
            </div>
            <div className="flex gap-5">
              <div className="w-96 overflow-y-auto max-h-[70vh] min-w-0 sticky top-0 bg-white">
                <h4>Type</h4>
                <RefinementList attribute="resource_type" />
                <h4>Metadata</h4>
                {metadataFacetsLoading ? <p>Loading metadata facets...</p> : null}
                {metadataFacetsError ? <p>Failed to load metadata facets.</p> : null}
                {metadataFacets.map(facet => (
                  <div key={facet.attribute} className="mb-3">
                    <h5 className="my-2 sticky top-0 py-2 bg-white">{facet.label}</h5>
                    <RefinementList attribute={facet.attribute} />
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <div className="my-2 sticky top-0 py-2 bg-white flex justify-center">
                  <Pagination />
                </div>
                <Hits hitComponent={Hit} />
                <div className="my-2 sticky bottom-0 py-2 bg-white flex justify-center">
                  <Pagination />
                </div>
              </div>
            </div>
          </InstantSearch>
        ) : null}
      </WidePage>
    </>
  );
};
