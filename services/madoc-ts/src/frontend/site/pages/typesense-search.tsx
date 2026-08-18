import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  Stats,
  useInfiniteHits,
  useInstantSearch,
  useSearchBox,
  useRefinementList,
} from 'react-instantsearch';
import TypesenseInstantSearchAdapterImport from 'typesense-instantsearch-adapter';
import { getTypesenseProjectFilter } from '../../../search/typesense/project-filter';
import { DisplayBreadcrumbs } from '../blocks/Breadcrumbs';
import { LoadingBlock } from '../../shared/callouts/LoadingBlock';
import { HrefLink } from '../../shared/utility/href-link';
import { useSite } from '../../shared/hooks/use-site';
import {
  resolveTypesenseHitPrimaryLink,
  type TypesenseAutocompleteHit,
  useTypesenseSiteAutocomplete,
} from '../../shared/hooks/use-typesense-site-autocomplete';
import { Search as LegacySearch } from './search';
import { useProject } from '../hooks/use-project';
import { useRouteContext } from '../hooks/use-route-context';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { GridIcon } from '../../shared/icons/GridIcon';
import { UnorderedListIcon } from '../../shared/icons/UnorderedListIcon';
import { useInfiniteAction } from '../hooks/use-infinite-action';
import { useApi } from '../../shared/hooks/use-api';
import { PublicProjectSearchIndex } from '../../../types/schemas/project-search-index';
import { getProjectSearchFacetFieldName } from '../../shared/capture-models/helpers/project-search-index-options';

const TypesenseInstantSearchAdapter =
  (TypesenseInstantSearchAdapterImport as unknown as { default?: typeof TypesenseInstantSearchAdapterImport })
    .default || TypesenseInstantSearchAdapterImport;

// Scoped overrides — only target the ais-* classes we need to neutralise so that
// our own Tailwind card styles are the single source of truth.
const aisResetStyles = `
  .ais-Hits-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .ais-Hits-item {
    all: unset;
    display: flex;
  }
  .ais-Pagination-list {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .ais-Pagination-item {
    display: inline-flex;
  }
  .ais-Pagination-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.5rem;
    border-radius: 0.375rem;
    border: 1px solid #d1d5db;
    background: #fff;
    color: #374151;
    font-size: 0.875rem;
    cursor: pointer;
    text-decoration: none;
    transition: background 120ms, border-color 120ms;
  }
  .ais-Pagination-link:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
  .ais-Pagination-item--selected .ais-Pagination-link {
    background: #1d4ed8;
    border-color: #1d4ed8;
    color: #fff;
    font-weight: 600;
  }
  .ais-Pagination-item--disabled .ais-Pagination-link {
    opacity: 0.4;
    cursor: default;
    pointer-events: none;
  }
  .ais-RefinementList-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .ais-RefinementList-item {
    display: block;
    font-size: 0.875rem;
    line-height: 1.75rem;
  }
  .ais-RefinementList-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
  }
  .ais-RefinementList-checkbox {
    accent-color: #1d4ed8;
    width: 0.9rem;
    height: 0.9rem;
    flex-shrink: 0;
  }
  .ais-RefinementList-labelText {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #374151;
  }
  .ais-RefinementList-item--selected .ais-RefinementList-labelText {
    font-weight: 600;
    color: #1d4ed8;
  }
  .ais-RefinementList-count {
    margin-left: auto;
    font-size: 0.7rem;
    color: #6b7280;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 9999px;
    padding: 0 0.35rem;
    line-height: 1.25rem;
    flex-shrink: 0;
  }
  .ais-RefinementList-showMore {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #1d4ed8;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-decoration: underline;
  }
  .ais-Stats-text {
    font-size: 0.8rem;
    color: #6b7280;
    margin: 0.25rem 0 0.75rem;
  }
  .ais-Highlight-highlighted,
  .ais-Snippet-highlighted {
    background-color: rgba(84, 104, 255, 0.1);
    color: #3730a3;
    font-style: normal;
    border-radius: 2px;
    padding: 0 1px;
  }
`;

type TypesenseStatus = {
  available: boolean;
  collection: string;
  reason?: string;
};

type TypesenseFacetCount = {
  count: number;
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

type VisibleFacetItem = {
  value: string;
  label: string;
  count: number;
  isRefined: boolean;
};

type SearchRouteState = {
  fulltext?: string | string[];
  page?: string | string[];
  refinements?: string | string[];
  index?: string | string[];
};

type SearchPageUiState = {
  query?: string;
  page?: number;
  refinementList?: Record<string, string[]>;
};

type SearchView = 'grid' | 'list';

interface TypesenseSearchDocument extends TypesenseAutocompleteHit {
  search_text?: string;
  entity_type?: string;
}

type TypesenseSearchHit = ReturnType<typeof useInfiniteHits<TypesenseSearchDocument>>['items'][number];

const blacklistedMetadataFacetLabels = new Set(['label', 'summary', 'description', 'notes', 'note', 'noot']);
const blacklistedMetadataFacetIncludes = ['label', 'oclc', 'link', 'description', 'related'];

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
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 1 ? parsed : undefined;
}

function parseRouteRefinements(value?: string) {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;
    const refinementList = Object.entries(parsed).reduce<Record<string, string[]>>((acc, [key, values]) => {
      if (!Array.isArray(values)) return acc;
      const normalizedValues = values.filter((item): item is string => typeof item === 'string');
      if (!normalizedValues.length) return acc;
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

function getNodeConfig(slug?: string, projectSlug?: string, indexId?: string) {
  if (typeof window === 'undefined' || !slug) return null;
  return {
    host: window.location.hostname,
    port: Number(window.location.port || (window.location.protocol === 'https:' ? '443' : '80')),
    protocol: window.location.protocol.replace(':', ''),
    path:
      projectSlug && indexId
        ? `/s/${slug}/madoc/api/projects/${encodeURIComponent(projectSlug)}/typesense/${encodeURIComponent(indexId)}`
        : `/s/${slug}/madoc/api/typesense`,
  };
}

function metadataFacetLabelFromAttribute(attribute: string) {
  return attribute
    .replace(/^metadata_/, '')
    .replace(/_/g, ' ')
    .trim();
}

function isBlacklistedMetadataFacetLabel(label: string) {
  const normalizedLabel = label.trim().toLowerCase();

  if (blacklistedMetadataFacetLabels.has(normalizedLabel)) {
    return true;
  }

  return blacklistedMetadataFacetIncludes.some(blacklistedInclude => normalizedLabel.includes(blacklistedInclude));
}

function getFacetTotalCount(facet: TypesenseFacet) {
  return facet.counts.reduce((total, next) => total + next.count, 0);
}

function getFacetAvailabilityScore(facet: TypesenseFacet) {
  const availableValueCount = facet.counts.length;

  if (availableValueCount <= 1) {
    return 0.2;
  }

  return Math.min(availableValueCount, 5) / 5;
}

function getFacetGroupingScore(facet: TypesenseFacet) {
  const totalCount = getFacetTotalCount(facet);

  if (!totalCount || !facet.counts.length) {
    return 0;
  }

  const concentrationScore = facet.counts.reduce((score, next) => {
    const ratio = next.count / totalCount;
    return score + ratio * ratio;
  }, 0);

  return concentrationScore * getFacetAvailabilityScore(facet);
}

function sortMetadataFacetsByGrouping(a: TypesenseFacet, b: TypesenseFacet) {
  const groupingScoreDifference = getFacetGroupingScore(b) - getFacetGroupingScore(a);
  if (groupingScoreDifference !== 0) {
    return groupingScoreDifference;
  }

  const largestBucketDifference =
    Math.max(...b.counts.map(count => count.count)) - Math.max(...a.counts.map(count => count.count));
  if (largestBucketDifference !== 0) {
    return largestBucketDifference;
  }

  const bucketCountDifference = b.counts.length - a.counts.length;
  if (bucketCountDifference !== 0) {
    return bucketCountDifference;
  }

  return metadataFacetLabelFromAttribute(a.field_name).localeCompare(metadataFacetLabelFromAttribute(b.field_name));
}

function SearchDefaults({ projectFilter }: { projectFilter?: string }) {
  return <Configure hitsPerPage={24} filters={projectFilter || undefined} />;
}

const SearchInputWithAutocomplete: React.FC<{ projectId?: number; autocomplete?: boolean }> = ({
  projectId,
  autocomplete = true,
}) => {
  const [focused, setFocused] = useState(false);
  const { query, refine } = useSearchBox();
  const { available, suggestions, isLoadingSuggestions } = useTypesenseSiteAutocomplete(query, {
    enabled: autocomplete,
    limit: 8,
    projectId,
  });
  const showSuggestions = available && focused && query.trim().length > 1;

  return (
    <div className="relative mb-1 max-w-[40rem]">
      <input
        className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        type="search"
        value={query}
        placeholder="Search resources…"
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        onChange={event => refine(event.target.value)}
      />
      {showSuggestions ? (
        <ul className="absolute left-0 right-0 top-[calc(100%+0.3rem)] z-20 m-0 max-h-72 list-none overflow-y-auto rounded-md border border-slate-200 bg-white p-0 shadow-lg">
          {isLoadingSuggestions && suggestions.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-slate-500">Loading suggestions…</li>
          ) : null}
          {!isLoadingSuggestions && suggestions.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-slate-500">No suggestions</li>
          ) : null}
          {suggestions.map(suggestion => (
            <li
              key={suggestion.resource_id || `${suggestion.resource_type}-${suggestion.resource_label || 'result'}`}
              className="border-b border-slate-100 last:border-b-0"
            >
              <button
                type="button"
                className="w-full bg-transparent px-4 py-2.5 text-left transition hover:bg-slate-50"
                onMouseDown={event => {
                  event.preventDefault();
                  refine(suggestion.resource_label || suggestion.resource_id || query);
                  setFocused(false);
                }}
              >
                <div className="text-sm font-semibold text-gray-800">{suggestion.resource_label || 'Untitled'}</div>
                <div className="text-xs text-slate-400">
                  {suggestion.resource_type || 'Resource'}
                  {suggestion.resource_id ? ` · ${suggestion.resource_id}` : ''}
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

function HitCard({ hit, view }: { hit: TypesenseSearchHit; view: SearchView }) {
  const { projectId } = useRouteContext();
  const { indexUiState } = useInstantSearch();
  const selectedProject = indexUiState.refinementList?.project_facets?.[0]?.split('|', 1)[0];
  const primaryLink = resolveTypesenseHitPrimaryLink(hit, projectId || selectedProject);
  const isList = view === 'list';
  const thumbnail = hit.thumbnail ? (
    <img
      className={`block bg-slate-100 object-cover ${isList ? 'h-32 w-40' : 'h-44 w-full'}`}
      src={hit.thumbnail}
      alt={hit.resource_label || 'Search result thumbnail'}
    />
  ) : (
    <div className={`flex items-center justify-center bg-slate-100 ${isList ? 'h-32 w-40' : 'h-44 w-full'}`}>
      <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75L7.5 9l4.5 6 3-4 4.5 6H2.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 8.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    </div>
  );

  return (
    <article
      className={`flex h-full w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md ${
        isList ? 'flex-row' : 'flex-col'
      }`}
    >
      {primaryLink ? (
        <HrefLink href={primaryLink} className={`block shrink-0 ${isList ? '' : 'w-full'}`}>
          {thumbnail}
        </HrefLink>
      ) : (
        <div className={`shrink-0 ${isList ? '' : 'w-full'}`}>{thumbnail}</div>
      )}

      <div className="flex flex-1 flex-col p-3.5">
        <span className="mb-2 inline-block self-start rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">
          {hit.entity_type || hit.resource_type || 'resource'}
        </span>

        <h3
          className="mb-1 text-sm font-semibold leading-snug text-slate-900"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {primaryLink ? (
            <HrefLink href={primaryLink} className="text-blue-700 no-underline hover:underline">
              <Highlight hit={hit} attribute="resource_label" />
            </HrefLink>
          ) : (
            <Highlight hit={hit} attribute="resource_label" />
          )}
        </h3>

        <div
          className="mt-auto text-xs leading-relaxed text-slate-600"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
          }}
        >
          <Highlight hit={hit} attribute="search_text" />
        </div>
      </div>
    </article>
  );
}

function GridHitCard({ hit }: { hit: TypesenseSearchHit }) {
  return <HitCard hit={hit} view="grid" />;
}

function ListHitCard({ hit }: { hit: TypesenseSearchHit }) {
  return <HitCard hit={hit} view="list" />;
}

function ResourceTypeTabs({
  customIndexes,
  activeCustomIndex,
  onCustomIndex,
  onBaseType,
}: {
  customIndexes: PublicProjectSearchIndex[];
  activeCustomIndex?: string;
  onCustomIndex: (indexId: string) => void;
  onBaseType: (resourceType?: string) => void;
}) {
  const { items, refine } = useRefinementList(
    { attribute: 'resource_type', limit: 20 },
    { $$widgetType: 'ais.refinementList' }
  );
  const refinedItems = items.filter(item => item.isRefined);
  const tabs = [
    { label: 'All resources', value: undefined },
    { label: 'Projects', value: 'Project' },
    { label: 'Collections', value: 'Collection' },
    { label: 'Manifests', value: 'Manifest' },
    { label: 'Canvases', value: 'Canvas' },
  ];
  const allResourcesCount = items.reduce((total, item) => total + item.count, 0);

  return (
    <div className="mb-5 border-b border-slate-200" role="tablist" aria-label="Resource type">
      <div className="flex gap-6">
        {tabs.map(tab => {
          const isActive = !activeCustomIndex && (tab.value
            ? refinedItems.length === 1 && refinedItems[0].value === tab.value
            : refinedItems.length === 0);
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`border-b-2 px-1 pb-2.5 text-sm font-medium transition ${
                isActive
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
              }`}
              onClick={() => {
                if (activeCustomIndex) {
                  onBaseType(tab.value);
                  return;
                }
                refinedItems.forEach(item => refine(item.value));
                if (tab.value && !refinedItems.some(item => item.value === tab.value)) refine(tab.value);
              }}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                {(tab.value
                  ? items.find(item => item.value === tab.value)?.count || 0
                  : allResourcesCount
                ).toLocaleString()}
              </span>
            </button>
          );
        })}
        {customIndexes.map(index => (
          <button
            key={index.id}
            type="button"
            role="tab"
            aria-selected={activeCustomIndex === index.id}
            className={`border-b-2 px-1 pb-2.5 text-sm font-medium transition ${
              activeCustomIndex === index.id
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
            }`}
            onClick={() => onCustomIndex(index.id)}
          >
            {index.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: SearchView; onChange: (view: SearchView) => void }) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border border-slate-300 bg-white" aria-label="Result view">
      {[
        { value: 'grid' as const, label: 'Grid view', icon: <GridIcon className="h-4 w-4" /> },
        { value: 'list' as const, label: 'List view', icon: <UnorderedListIcon className="h-4 w-4" /> },
      ].map(option => (
        <button
          key={option.value}
          type="button"
          aria-label={option.label}
          aria-pressed={view === option.value}
          title={option.label}
          className={`flex h-8 w-9 items-center justify-center border-r border-slate-300 last:border-r-0 ${
            view === option.value ? 'bg-blue-700 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}

function InfiniteSearchResults({ view }: { view: SearchView }) {
  const { items, isLastPage, showMore } = useInfiniteHits<TypesenseSearchDocument>({});
  const [loadMoreButton] = useInfiniteAction({ canFetchMore: !isLastPage, fetchMore: showMore });

  return (
    <>
      <ul
        className={`m-0 mb-6 list-none p-0 ${
          view === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4' : 'flex flex-col gap-3'
        }`}
      >
        {items.map(hit => (
          <li key={hit.objectID} className="m-0 flex border-0 bg-transparent p-0 shadow-none">
            <HitCard hit={hit} view={view} />
          </li>
        ))}
      </ul>
      {!isLastPage ? (
        <div className="flex justify-center">
          <button
            ref={loadMoreButton}
            type="button"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={showMore}
          >
            Load more results
          </button>
        </div>
      ) : null}
    </>
  );
}

const SidebarSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8 last:mb-0">
    <h4 className="mb-2 text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">{title}</h4>
    {children}
  </div>
);

const FacetOptionList: React.FC<{
  items: VisibleFacetItem[];
  refine: (value: string) => void;
  canToggleShowMore: boolean;
  isShowingMore: boolean;
  toggleShowMore: () => void;
}> = ({ items, refine, canToggleShowMore, isShowingMore, toggleShowMore }) => (
  <>
    <ul className="m-0 list-none space-y-1 p-0">
      {items.map(item => (
        <li key={item.value}>
          <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-slate-50">
            <input
              className="h-4 w-4 shrink-0 accent-blue-700"
              type="checkbox"
              checked={item.isRefined}
              onChange={() => refine(item.value)}
            />
            <span
              className={`min-w-0 flex-1 truncate ${item.isRefined ? 'font-semibold text-blue-700' : 'text-slate-700'}`}
            >
              {item.label}
            </span>
            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-1.5 text-[0.7rem] leading-5 text-slate-500">
              {item.count}
            </span>
          </label>
        </li>
      ))}
    </ul>
    {canToggleShowMore ? (
      <button
        type="button"
        className="mt-2 text-xs font-medium text-blue-700 underline underline-offset-2"
        onClick={() => toggleShowMore()}
      >
        {isShowingMore ? 'Show less' : 'Show more'}
      </button>
    ) : null}
  </>
);

const ProjectFacet = () => {
  const { items, refine, canToggleShowMore, isShowingMore, toggleShowMore } = useRefinementList(
    {
      attribute: 'project_facets',
      limit: 8,
      showMore: true,
      showMoreLimit: 30,
      sortBy: ['isRefined:desc', 'count:desc', 'name:asc'],
    },
    {
      $$widgetType: 'ais.refinementList',
    }
  );
  const visibleItems = useMemo<VisibleFacetItem[]>(
    () =>
      items
        .filter(item => item.count > 0 || item.isRefined)
        .map(item => {
          const separatorIndex = item.value.indexOf('|');
          return {
            ...item,
            label: separatorIndex === -1 ? item.label : item.value.slice(separatorIndex + 1),
          };
        }),
    [items]
  );

  if (!visibleItems.length) {
    return null;
  }

  return (
    <SidebarSection title="Project">
      <FacetOptionList
        items={visibleItems}
        refine={refine}
        canToggleShowMore={canToggleShowMore}
        isShowingMore={isShowingMore}
        toggleShowMore={toggleShowMore}
      />
    </SidebarSection>
  );
};

const MetadataFacetList: React.FC<MetadataFacet> = ({ attribute, label }) => {
  const { items, refine, canToggleShowMore, isShowingMore, toggleShowMore } = useRefinementList(
    {
      attribute,
      limit: 6,
      showMore: true,
      showMoreLimit: 20,
      sortBy: ['isRefined:desc', 'count:desc', 'name:asc'],
    },
    {
      $$widgetType: 'ais.refinementList',
    }
  );
  const visibleItems = useMemo<VisibleFacetItem[]>(
    () => items.filter(item => item.count > 0 || item.isRefined),
    [items]
  );

  if (!visibleItems.length) {
    return null;
  }

  return (
    <div>
      <p className="mb-2 text-[0.75rem] font-medium capitalize text-slate-500">{label}</p>
      <FacetOptionList
        items={visibleItems}
        refine={refine}
        canToggleShowMore={canToggleShowMore}
        isShowingMore={isShowingMore}
        toggleShowMore={toggleShowMore}
      />
    </div>
  );
};

const MetadataFacetSections: React.FC<{ facets: MetadataFacet[]; custom?: boolean }> = ({ facets, custom }) => {
  const visibleFacets = useMemo(
    () => (custom ? facets : facets.filter(facet => !isBlacklistedMetadataFacetLabel(facet.label))),
    [custom, facets]
  );

  if (!visibleFacets.length) {
    return null;
  }

  return (
    <SidebarSection title={custom ? 'Facets' : 'Metadata'}>
      <div className="space-y-6">
        {visibleFacets.map(facet => (
          <MetadataFacetList key={facet.attribute} attribute={facet.attribute} label={facet.label} />
        ))}
      </div>
    </SidebarSection>
  );
};

export function TypesenseSearch() {
  const site = useSite();
  const api = useApi();
  const { project: siteConfiguration } = useSiteConfiguration();
  const { projectId: projectSlug } = useRouteContext();
  const { data: project } = useProject();
  const [activeCustomIndexId, setActiveCustomIndexId] = useState<string | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    return new URLSearchParams(window.location.search).get('index') || undefined;
  });
  const [view, setView] = useState<SearchView>('grid');
  const projectFilter = getTypesenseProjectFilter(project?.id);
  const infiniteScroll = siteConfiguration.searchOptions?.infiniteScroll !== false;
  const customIndexes = useQuery<PublicProjectSearchIndex[]>(
    ['project-public-search-indexes', site.slug, project?.slug],
    () => api.getPublicProjectSearchIndexes(project!.slug),
    { enabled: !!project?.slug }
  );
  const activeCustomIndex = customIndexes.data?.find(index => index.id === activeCustomIndexId);
  const node = useMemo(
    () => getNodeConfig(site.slug, activeCustomIndex ? project?.slug : undefined, activeCustomIndex?.id),
    [activeCustomIndex, project?.slug, site.slug]
  );

  useEffect(() => {
    if (activeCustomIndexId && customIndexes.data && !activeCustomIndex) setActiveCustomIndexId(undefined);
  }, [activeCustomIndex, activeCustomIndexId, customIndexes.data]);

  const selectCustomIndex = (indexId: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('index', indexId);
      url.searchParams.delete('refinements');
      url.searchParams.delete('page');
      window.history.replaceState(window.history.state, '', url);
    }
    setActiveCustomIndexId(indexId);
  };

  const selectBaseResourceType = (resourceType?: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('index');
      url.searchParams.delete('page');
      if (resourceType) {
        url.searchParams.set('refinements', JSON.stringify({ resource_type: [resourceType] }));
      } else {
        url.searchParams.delete('refinements');
      }
      window.history.replaceState(window.history.state, '', url);
    }
    setActiveCustomIndexId(undefined);
  };

  const { data, isLoading, error } = useQuery<TypesenseStatus>(
    ['site-typesense-search-status', site.slug],
    async () => {
      const response = await fetch(`/s/${site.slug}/madoc/api/typesense/status`, { credentials: 'include' });
      if (!response.ok) throw new Error(`Failed with status ${response.status}`);
      return response.json();
    }
  );

  const {
    data: metadataFacets = [],
    isLoading: metadataFacetsLoading,
    error: metadataFacetsError,
  } = useQuery<MetadataFacet[]>(
    ['site-typesense-search-metadata-facets', site.slug, data?.collection, project?.id],
    async () => {
      const response = await fetch(`/s/${site.slug}/madoc/api/typesense`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: '*',
          query_by: 'resource_label,search_text',
          per_page: 0,
          facet_by: 'metadata_*',
          filter_by: projectFilter,
          max_facet_values: 25,
        }),
      });
      if (!response.ok) throw new Error(`Failed with status ${response.status}`);
      const body = await response.json();
      const allFacets = Array.isArray(body?.facet_counts) ? (body.facet_counts as TypesenseFacet[]) : [];
      return allFacets
        .filter(facet => {
          if (!facet || typeof facet.field_name !== 'string') return false;
          if (!facet.field_name.startsWith('metadata_')) return false;
          if (facet.field_name === 'metadata_keys' || facet.field_name === 'metadata_pairs') return false;
          return Array.isArray(facet.counts) && facet.counts.length > 0;
        })
        .sort(sortMetadataFacetsByGrouping)
        .map(facet => ({ attribute: facet.field_name, label: metadataFacetLabelFromAttribute(facet.field_name) }))
        .filter(facet => !isBlacklistedMetadataFacetLabel(facet.label));
    },
    { enabled: !activeCustomIndex && !!data?.available && !!site.slug && (!projectSlug || !!project?.id) }
  );

  const visibleFacets = activeCustomIndex
    ? activeCustomIndex.facets.map(facet => ({
        attribute: getProjectSearchFacetFieldName(facet.path),
        label: facet.label,
      }))
    : metadataFacets;

  const adapter = useMemo(() => {
    if (!data?.available || !node) return null;
    return new TypesenseInstantSearchAdapter({
      server: {
        apiKey: 'madoc-typesense-proxy',
        nodes: [node],
        cacheSearchResultsForSeconds: 0,
      },
      additionalSearchParameters: {
        query_by: activeCustomIndex ? 'resource_label,search_text' : 'resource_label,search_text,search_context',
      },
    });
  }, [activeCustomIndex, data?.available, node]);

  const collection = activeCustomIndex?.collection || data?.collection;

  const routing = useMemo(() => {
    if (!collection) return undefined;
    return {
      stateMapping: {
        stateToRoute(uiState: Record<string, SearchPageUiState | undefined>): SearchRouteState {
          const indexUiState = uiState[collection];
          const refinements =
            indexUiState?.refinementList && Object.keys(indexUiState.refinementList).length
              ? JSON.stringify(indexUiState.refinementList)
              : undefined;
          return {
            fulltext: indexUiState?.query || undefined,
            page: indexUiState?.page && indexUiState.page > 1 ? String(indexUiState.page) : undefined,
            refinements,
            index: activeCustomIndex?.id,
          };
        },
        routeToState(routeState: SearchRouteState) {
          return {
            [collection]: {
              query: getSingleValue(routeState.fulltext) || '',
              page: parseRoutePage(getSingleValue(routeState.page)),
              refinementList: parseRouteRefinements(getSingleValue(routeState.refinements)),
            },
          };
        },
      },
    };
  }, [activeCustomIndex?.id, collection]);

  if (isLoading || (projectSlug && !project)) {
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
        <p className="text-sm text-slate-600">Failed to load Typesense search status.</p>
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
        <p className="text-sm text-slate-600">
          Typesense search is unavailable: {String(data.reason || 'No reason provided')}.
        </p>
      </>
    );
  }

  return (
    <>
      <style>{aisResetStyles}</style>
      <DisplayBreadcrumbs currentPage="Search" />
      <InstantSearch key={collection} searchClient={adapter.searchClient} indexName={collection!} routing={routing}>
        <SearchDefaults projectFilter={activeCustomIndex ? undefined : projectFilter} />

        <div className="mb-4">
          <SearchInputWithAutocomplete projectId={project?.id} autocomplete={!activeCustomIndex} />
        </div>

        <ResourceTypeTabs
          customIndexes={customIndexes.data || []}
          activeCustomIndex={activeCustomIndex?.id}
          onCustomIndex={selectCustomIndex}
          onBaseType={selectBaseResourceType}
        />

        <div className="mb-4 flex items-center justify-between gap-4">
          <Stats />
          <ViewToggle view={view} onChange={setView} />
        </div>

        <div className="flex flex-col items-start gap-6 md:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 pr-2 md:sticky md:top-4 md:max-h-[calc(100vh-2rem)] md:w-64 md:overflow-y-auto">
            {!projectSlug ? <ProjectFacet /> : null}
            {((!activeCustomIndex && metadataFacetsLoading) || visibleFacets.length > 0 || !!metadataFacetsError) && (
              <>
                {!activeCustomIndex && metadataFacetsLoading ? (
                  <SidebarSection title="Metadata">
                    <p className="text-xs text-slate-400">Loading…</p>
                  </SidebarSection>
                ) : metadataFacetsError ? (
                  <SidebarSection title="Metadata">
                    <p className="text-xs text-red-400">Failed to load metadata facets.</p>
                  </SidebarSection>
                ) : (
                  <MetadataFacetSections facets={visibleFacets} custom={!!activeCustomIndex} />
                )}
              </>
            )}
          </aside>

          {/* Results */}
          <main id="search-results" className="min-w-0 flex-1">
            {infiniteScroll ? (
              <InfiniteSearchResults view={view} />
            ) : (
              <>
                <Hits
                  hitComponent={view === 'grid' ? GridHitCard : ListHitCard}
                  classNames={{
                    root: 'mb-6',
                    list:
                      view === 'grid'
                        ? 'm-0 grid list-none grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4 p-0'
                        : 'm-0 flex list-none flex-col gap-3 p-0',
                    item: 'm-0 flex h-full border-0 bg-transparent p-0 shadow-none',
                  }}
                />
                <div className="flex justify-center">
                  <Pagination />
                </div>
              </>
            )}
          </main>
        </div>
      </InstantSearch>
    </>
  );
}
