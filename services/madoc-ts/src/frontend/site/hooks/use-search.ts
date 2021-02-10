import { InternationalString } from '@hyperion-framework/types/iiif/descriptive';
import { useMemo } from 'react';
import { FacetConfig } from '../../shared/components/MetadataFacetEditor';
import { apiHooks, paginatedApiHooks } from '../../shared/hooks/use-api-query';
import { useSearchQuery } from './use-search-query';

export function useSearch() {
  const { fulltext, appliedFacets, page } = useSearchQuery();
  const searchFacetConfig = apiHooks.getSiteSearchFacetConfiguration(() => []);

  const [facetsToRequest, facetDisplayOrder, facetIdMap] = useMemo(() => {
    const facets = searchFacetConfig.data ? searchFacetConfig.data.facets : [];
    const returnList: string[] = [];
    const idMap: { [id: string]: { config: FacetConfig; keys: string[] } } = {};
    const displayOrder: string[] = [];

    for (const facet of facets) {
      displayOrder.push(facet.id);
      idMap[facet.id] = { config: facet, keys: [] };
      if (facet.keys) {
        for (const key of facet.keys) {
          const keyToAdd = key.startsWith('metadata.')
            ? key.slice('metadata.'.length).toLowerCase()
            : key.toLowerCase();
          idMap[facet.id].keys.push(keyToAdd);
          if (returnList.indexOf(keyToAdd) === -1) {
            returnList.push(keyToAdd);
          }
        }
      }
    }
    return [returnList, displayOrder, idMap];
  }, [searchFacetConfig.data]);

  const searchResponse = paginatedApiHooks.getSiteSearchQuery(
    () => [
      {
        fulltext: fulltext,
        facet_fields: facetsToRequest.length ? facetsToRequest : undefined,
        //  @todo stringify facets.
        facets: appliedFacets.map(facet => ({
          type: 'metadata',
          subtype: facet.k,
          value: facet.v,
        })),
        number_of_facets: searchFacetConfig.data?.facets.length ? 100 : undefined,
        //facets_: [{ type: 'metadata', subtype: 'title', value: 'Wunder der Vererbung' }],
        // contexts: query.madoc_id ? [query.madoc_id] : undefined,
      },
      page,
    ],
    {
      enabled: !searchFacetConfig.isLoading && (!!facetsToRequest.length || !!fulltext),
    }
  );

  const displayFacets = useMemo(() => {
    // We need to display the facets. We have two lists.
    // mappedFacets:
    // {
    //   title: {id: "8159f355-3ca7-4f25-8100-80919b20a064", keys: ['metadata.Title'], values: Array(0), label: {…}}
    // }
    //
    // searchResponse.data.facets
    // {
    //   metadata: {
    //     title: {
    //       'Wunder der Vererbung': 1,
    //     }
    //   }
    // }
    //
    // And we want to format this into a single list. The following rules applied:
    // - If mapped facets contains multiple keys, they should be merged together.
    // - If the values list is not empty, only those values should be used.
    // - The internationalised label should be used
    const mappedSearchResponseMetadata: {
      [key: string]: Array<{ key: string; value: string; count: number; configuration?: FacetConfig }>;
    } = {};
    const metadataFacets = searchResponse.resolvedData?.facets?.metadata || {};

    const showAllFacets = facetDisplayOrder.length === 0;

    for (const facet of Object.keys(metadataFacets)) {
      const values = Object.keys(metadataFacets[facet]);
      const normalisedKey = facet.toLowerCase();

      if (showAllFacets) {
        facetIdMap[facet] = {
          config: {
            keys: [facet],
            values: [],
            label: { none: [facet] },
            id: facet,
          },
          keys: [facet],
        };
        facetDisplayOrder.push(facet);
      }

      for (const value of values) {
        mappedSearchResponseMetadata[normalisedKey] = mappedSearchResponseMetadata[normalisedKey]
          ? mappedSearchResponseMetadata[normalisedKey]
          : [];
        mappedSearchResponseMetadata[normalisedKey].push({
          value,
          count: metadataFacets[facet] ? (metadataFacets[facet] as any)[value] || 0 : 0,
          key: normalisedKey,
        });
      }
    }

    // Compile the final list.
    const displayList: Array<{
      id: string;
      label: InternationalString;
      items: Array<{
        key: string;
        value: string;
        count: number;
      }>;
    }> = [];

    for (const id of facetDisplayOrder) {
      const fieldsToMap = facetIdMap[id];
      const displayItem: {
        id: string;
        label: InternationalString;
        items: Array<{
          key: string;
          value: string;
          count: number;
        }>;
      } = {
        id: id,
        label: fieldsToMap.config.label,
        items: [],
      };
      for (const field of fieldsToMap.keys) {
        const searchResultFacetValues = mappedSearchResponseMetadata[field];
        if (searchResultFacetValues) {
          displayItem.items.push(...searchResultFacetValues);
        }
      }
      // @todo fieldsToMap.config.value
      displayList.push(displayItem);
    }

    return displayList;
  }, [facetDisplayOrder, facetIdMap, searchResponse.resolvedData]);

  return [searchResponse, displayFacets] as const;
}
