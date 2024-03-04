import { InternationalString } from '@iiif/presentation-3';
import { useEffect, useMemo } from 'react';
import { FacetConfig } from '../../shared/components/MetadataFacetEditor';
import { apiHooks, paginatedApiHooks } from '../../shared/hooks/use-api-query';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useRouteContext } from './use-route-context';
import { useSearchQuery } from './use-search-query';

function normalizeDotKey(key: string) {
  return key.startsWith('metadata.') ? key.slice('metadata.'.length).toLowerCase() : key.toLowerCase();
}

export function useSearch() {
  const { projectId, collectionId, manifestId, topic } = useRouteContext();
  const { fulltext, appliedFacets, page, rscType } = useSearchQuery();
  const {
    project: { searchStrategy, claimGranularity, searchOptions },
  } = useSiteConfiguration();
  const { searchMultipleFields, nonLatinFulltext, onlyShowManifests } = searchOptions || {};
  const searchFacetConfig = apiHooks.getSiteSearchFacetConfiguration(() => []);

  useEffect(() => {
    if (topic) {
      appliedFacets.push({ k: 'entity', v: topic, t: 'entity' });
    }
    return;
  }, [appliedFacets, topic]);

  const [facetsToRequest, facetDisplayOrder, facetIdMap] = useMemo(() => {
    const facets = !topic && searchFacetConfig.data ? searchFacetConfig.data.facets : [];
    const returnList: string[] = [];
    const idMap: { [id: string]: { config: FacetConfig; keys: string[] } } = {};
    const displayOrder: string[] = [];

    for (const facet of facets) {
      displayOrder.push(facet.id);
      idMap[facet.id] = { config: facet, keys: [] };
      if (facet.keys) {
        for (const key of facet.keys) {
          const keyToAdd = normalizeDotKey(key);
          idMap[facet.id].keys.push(keyToAdd);
          if (returnList.indexOf(keyToAdd) === -1) {
            returnList.push(keyToAdd);
          }
        }
      }
    }
    return [returnList, displayOrder, idMap];
  }, [searchFacetConfig.data, topic]);

  const topicFacets = appliedFacets.map(facet => {
    return facet.k === 'entity'
      ? {
          type: 'entity',
          group_id: facet.v,
        }
      : {
          type: facet.t,
          subtype: facet.k,
          value: facet.v,
        };
  });

  const searchQFacets = appliedFacets.map(facet => ({
    type: facet.t,
    subtype: facet.k,
    value: facet.v,
  }));

  const facets = topic ? topicFacets : searchQFacets;
  const waitForTopic = topic ? !!facets.length : true;
  const searchResults = paginatedApiHooks.getSiteSearchQuery(
    () => [
      {
        projectId,
        collectionId,
        manifestId,
        fulltext: fulltext,
        facet_fields: facetsToRequest.length ? facetsToRequest : undefined,
        //  @todo stringify facets.
        facets: facets,
        resource_type: rscType,
        facet_on_manifests: true,
        search_type: searchStrategy as any,
        number_of_facets: searchFacetConfig.data?.facets.length ? 100 : undefined,
        iiif_type: claimGranularity === 'manifest' || onlyShowManifests ? 'Manifest' : undefined,
        non_latin_fulltext: nonLatinFulltext,
        search_multiple_fields: searchMultipleFields,
      },
      page,
    ],
    {
      enabled:
        !searchFacetConfig.isLoading &&
        waitForTopic &&
        (!!facetsToRequest.length ||
          !!fulltext ||
          fulltext === '' ||
          !!facets ||
          !!rscType ||
          collectionId ||
          manifestId ||
          projectId ||
          !!topic),
      staleTime: 0,
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

    const metadataFacets = searchResults.resolvedData?.facets?.metadata || {};
    const entityFacets = searchResults.resolvedData?.facets?.entity || {};

    // const facetType = { ...metadataFacets, ...entityFacets };
    const showAllFacets = facetDisplayOrder.length === 0;
    // for (const facet of Object.keys(facetType)) {
    //   const values = Object.keys(facetType[facet]);
    //   const normalisedKey = facet.toLowerCase();

    for (const mfacet of Object.keys(metadataFacets)) {
      const values = Object.keys(metadataFacets[mfacet]);
      const normalisedKey = mfacet.toLowerCase();

      if (metadataFacets) {
        facetIdMap[mfacet] = {
          config: {
            keys: [mfacet],
            values: [],
            label: { none: [mfacet] },
            id: mfacet,
            type: 'metadata',
          },
          keys: [mfacet],
        };
        facetDisplayOrder.push(mfacet);
      }
      for (const value of values) {
        mappedSearchResponseMetadata[normalisedKey] = mappedSearchResponseMetadata[normalisedKey]
          ? mappedSearchResponseMetadata[normalisedKey]
          : [];
        mappedSearchResponseMetadata[normalisedKey].push({
          value,
          count: metadataFacets[mfacet] ? (metadataFacets[mfacet] as any)[value] || 0 : 0,
          key: normalisedKey,
        });
      }
    }

    for (const efacet of Object.keys(entityFacets)) {
      const values = Object.keys(entityFacets[efacet]);
      const normalisedKey = efacet.toLowerCase();

      if (entityFacets) {
        facetIdMap[efacet] = {
          config: {
            keys: [efacet],
            values: [],
            label: { none: [efacet] },
            id: efacet,
            type: 'entity',
          },
          keys: [efacet],
        };
        facetDisplayOrder.push(efacet);
      }
      for (const value of values) {
        mappedSearchResponseMetadata[normalisedKey] = mappedSearchResponseMetadata[normalisedKey]
          ? mappedSearchResponseMetadata[normalisedKey]
          : [];
        mappedSearchResponseMetadata[normalisedKey].push({
          value,
          count: entityFacets[efacet] ? (entityFacets[efacet] as any)[value] || 0 : 0,
          key: normalisedKey,
        });
      }
    }

    // Compile the final list.
    const displayList: Array<{
      id: string;
      label: InternationalString;
      items: Array<{
        type?: string;
        key: string;
        label: InternationalString;
        values: string[];
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
          label: InternationalString;
          values: string[];
          count: number;
          type?: string;
        }>;
      } = {
        id: id,
        label: fieldsToMap.config.label,
        items: [],
      };

      if (fieldsToMap.config.values && fieldsToMap.config.values.length) {
        for (const value of fieldsToMap.config.values) {
          const key = fieldsToMap.keys[0];
          const mappedCount = (mappedSearchResponseMetadata[key] || []).reduce((count: number, next) => {
            if (next.key === key && value.values.indexOf(next.value) !== -1) {
              return count + next.count;
            }
            return count;
          }, 0);
          displayItem.items.push({
            values: value.values,
            key: normalizeDotKey(fieldsToMap.keys[0]),
            count: mappedCount,
            label: value.label,
            type: fieldsToMap.config.type,
          });
        }
      } else {
        for (const field of fieldsToMap.keys) {
          const normalisedField = field.toLowerCase();
          const searchResultFacetValues = mappedSearchResponseMetadata[normalisedField];
          if (searchResultFacetValues) {
            displayItem.items.push(
              ...searchResultFacetValues.map(fieldValue => ({
                label: { none: [fieldValue.value] },
                key: fieldValue.key,
                values: [fieldValue.value],
                count: fieldValue.count,
                type: fieldsToMap.config.type,
              }))
            );
          }
        }
      }
      // @todo fieldsToMap.config.value
      displayList.push(displayItem);
    }

    return displayList;
  }, [facetDisplayOrder, facetIdMap, searchResults.resolvedData, searchFacetConfig.isLoading, searchResults.isLoading]);
  return [searchResults, displayFacets, searchFacetConfig.isLoading || searchResults.isLoading] as const;
}
