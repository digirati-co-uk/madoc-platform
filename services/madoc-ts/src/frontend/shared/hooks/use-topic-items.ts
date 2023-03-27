import { usePaginatedQuery } from 'react-query';
import { useApi } from './use-api';
import { useSearchQuery } from '../../site/hooks/use-search-query';
import { useMemo } from 'react';
import { FacetConfig } from '../components/MetadataFacetEditor';
import { InternationalString } from '@iiif/presentation-3';

export function useTopicItems(slug: string) {
  const api = useApi();

  const { fulltext, appliedFacets, page } = useSearchQuery();
  const query = { fulltext: fulltext, facets: appliedFacets, page: page };

  const resp = usePaginatedQuery(
    ['topic-items', { id: slug, page }],
    async () => {
      return api.getSearchQuery(
        {
          ...query,
          facets: [{ type: 'entity', indexable_text: slug }],
        } as any,
        page
      );
    },
    { enabled: !!slug }
  );

  // function normalizeDotKey(key: string) {
  //   return key.startsWith('metadata.') ? key.slice('metadata.'.length).toLowerCase() : key.toLowerCase();
  // }
  // const [facetDisplayOrder, facetIdMap] = useMemo(() => {
  //   const facets = [];
  //   const returnList: string[] = [];
  //   const idMap: { [id: string]: { config: FacetConfig; keys: string[] } } = {};
  //   const displayOrder: string[] = [];
  //
  //   for (const facet of facets) {
  //     displayOrder.push(facet.id);
  //     idMap[facet.id] = { config: facet, keys: [] };
  //     if (facet.keys) {
  //       for (const key of facet.keys) {
  //         const keyToAdd = normalizeDotKey(key);
  //         idMap[facet.id].keys.push(keyToAdd);
  //         if (returnList.indexOf(keyToAdd) === -1) {
  //           returnList.push(keyToAdd);
  //         }
  //       }
  //     }
  //   }
  //   return [returnList, displayOrder, idMap];
  // }, []);

  // const displayFacets = useMemo(() => {
  //   const mappedSearchResponseMetadata: {
  //     [key: string]: Array<{ key: string; value: string; count: number; configuration?: FacetConfig }>;
  //   } = {};
  //   const metadataFacets = resp.resolvedData?.facets?.entity || {};
  //
  //   // const showAllFacets = facetDisplayOrder.length === 0;
  //
  //   for (const facet of Object.keys(metadataFacets)) {
  //     const values = Object.keys(metadataFacets[facet]);
  //     const normalisedKey = facet.toLowerCase();
  //
  //     facetIdMap[facet] = {
  //       config: {
  //         keys: [facet],
  //         values: [],
  //         label: { none: [facet] },
  //         id: facet,
  //       },
  //       keys: [facet],
  //     };
  //     facetDisplayOrder.push(facet);
  //
  //     for (const value of values) {
  //       mappedSearchResponseMetadata[normalisedKey] = mappedSearchResponseMetadata[normalisedKey]
  //         ? mappedSearchResponseMetadata[normalisedKey]
  //         : [];
  //       mappedSearchResponseMetadata[normalisedKey].push({
  //         value,
  //         count: metadataFacets[facet] ? (metadataFacets[facet] as any)[value] || 0 : 0,
  //         key: normalisedKey,
  //       });
  //     }
  //   }
  //
  //   // Compile the final list.
  //   const displayList: Array<{
  //     id: string;
  //     label: InternationalString;
  //     items: Array<{
  //       key: string;
  //       label: InternationalString;
  //       values: string[];
  //       count: number;
  //     }>;
  //   }> = [];
  //
  //   for (const id of facetDisplayOrder) {
  //     const fieldsToMap = facetIdMap[id];
  //     const displayItem: {
  //       id: string;
  //       label: InternationalString;
  //       items: Array<{
  //         key: string;
  //         label: InternationalString;
  //         values: string[];
  //         count: number;
  //       }>;
  //     } = {
  //       id: id,
  //       label: fieldsToMap.config.label,
  //       items: [],
  //     };
  //
  //     if (fieldsToMap.config.values && fieldsToMap.config.values.length) {
  //       for (const value of fieldsToMap.config.values) {
  //         const key = fieldsToMap.keys[0];
  //         const mappedCount = (mappedSearchResponseMetadata[key] || []).reduce((count: number, next) => {
  //           if (next.key === key && value.values.indexOf(next.value) !== -1) {
  //             return count + next.count;
  //           }
  //           return count;
  //         }, 0);
  //         displayItem.items.push({
  //           values: value.values,
  //           key: normalizeDotKey(fieldsToMap.keys[0]),
  //           count: mappedCount,
  //           label: value.label,
  //         });
  //       }
  //     } else {
  //       for (const field of fieldsToMap.keys) {
  //         const searchResultFacetValues = mappedSearchResponseMetadata[field];
  //         if (searchResultFacetValues) {
  //           displayItem.items.push(
  //             ...searchResultFacetValues.map(fieldValue => ({
  //               label: { none: [fieldValue.value] },
  //               key: fieldValue.key,
  //               values: [fieldValue.value],
  //               count: fieldValue.count,
  //             }))
  //           );
  //         }
  //       }
  //     }
  //     // @todo fieldsToMap.config.value
  //     displayList.push(displayItem);
  //   }
  //
  //   return displayList;
  // }, [facetDisplayOrder, facetIdMap, resp.resolvedData]);

  return [resp, resp.isLoading] as const;
}
