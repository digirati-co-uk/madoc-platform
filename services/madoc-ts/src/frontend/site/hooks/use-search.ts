import { InternationalString } from '@iiif/presentation-3';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FacetConfig } from '../../shared/features/MetadataFacetEditor';
import { apiHooks, paginatedApiHooks } from '../../shared/hooks/use-api-query';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useRouteContext } from './use-route-context';
import { useSearchQuery } from './use-search-query';

/**
 * Detects the primary script of a text string.
 * Returns 'cjk' for Chinese/Japanese/Korean, 'latin' for Latin-based scripts, or 'other'.
 */
function detectScript(text: string): 'cjk' | 'latin' | 'arabic' | 'cyrillic' | 'other' {
  if (!text || typeof text !== 'string') return 'other';

  // Count characters in different scripts
  let cjkCount = 0;
  let latinCount = 0;
  let arabicCount = 0;
  let cyrillicCount = 0;

  for (const char of text) {
    const code = char.charCodeAt(0);

    // CJK Unified Ideographs and extensions
    if (
      (code >= 0x4E00 && code <= 0x9FFF) ||   // CJK Unified Ideographs
      (code >= 0x3400 && code <= 0x4DBF) ||   // CJK Extension A
      (code >= 0x20000 && code <= 0x2A6DF) || // CJK Extension B
      (code >= 0x2A700 && code <= 0x2B73F) || // CJK Extension C
      (code >= 0x2B740 && code <= 0x2B81F) || // CJK Extension D
      (code >= 0xF900 && code <= 0xFAFF) ||   // CJK Compatibility Ideographs
      (code >= 0x3000 && code <= 0x303F) ||   // CJK Symbols and Punctuation
      (code >= 0x3040 && code <= 0x309F) ||   // Hiragana
      (code >= 0x30A0 && code <= 0x30FF) ||   // Katakana
      (code >= 0xAC00 && code <= 0xD7AF)      // Korean Hangul
    ) {
      cjkCount++;
    }
    // Latin characters
    else if (
      (code >= 0x0041 && code <= 0x005A) ||   // A-Z
      (code >= 0x0061 && code <= 0x007A) ||   // a-z
      (code >= 0x00C0 && code <= 0x00FF) ||   // Latin Extended-A
      (code >= 0x0100 && code <= 0x017F) ||   // Latin Extended-B
      (code >= 0x0180 && code <= 0x024F)      // Latin Extended Additional
    ) {
      latinCount++;
    }
    // Arabic
    else if (code >= 0x0600 && code <= 0x06FF) {
      arabicCount++;
    }
    // Cyrillic
    else if (code >= 0x0400 && code <= 0x04FF) {
      cyrillicCount++;
    }
  }

  // Determine dominant script
  const max = Math.max(cjkCount, latinCount, arabicCount, cyrillicCount);
  if (max === 0) return 'other';
  if (cjkCount === max) return 'cjk';
  if (latinCount === max) return 'latin';
  if (arabicCount === max) return 'arabic';
  if (cyrillicCount === max) return 'cyrillic';
  return 'other';
}

/**
 * Maps language codes to their expected scripts.
 */
function getExpectedScriptForLanguage(lang: string): 'cjk' | 'latin' | 'arabic' | 'cyrillic' | 'other' | null {
  const langLower = lang.toLowerCase().split('-')[0];

  // CJK languages
  if (['zh', 'ja', 'ko'].includes(langLower)) {
    return 'cjk';
  }

  // Latin-script languages
  if (['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'cs', 'sk', 'sv', 'da', 'no', 'fi', 'et', 'lv', 'lt', 'hu', 'ro', 'tr', 'vi', 'id', 'ms'].includes(langLower)) {
    return 'latin';
  }

  // Arabic-script languages
  if (['ar', 'fa', 'ur'].includes(langLower)) {
    return 'arabic';
  }

  // Cyrillic-script languages
  if (['ru', 'uk', 'bg', 'sr', 'mk', 'be'].includes(langLower)) {
    return 'cyrillic';
  }

  return null; // Unknown, don't filter
}

/**
 * Checks if a facet value matches the expected language based on script detection.
 */
function doesValueMatchLanguage(value: string, currentLanguage: string): boolean {
  const expectedScript = getExpectedScriptForLanguage(currentLanguage);

  // If we don't know what script to expect, don't filter
  if (!expectedScript) return true;

  const detectedScript = detectScript(value);

  // If we can't detect the script (numbers, punctuation only), keep it
  if (detectedScript === 'other') return true;

  return detectedScript === expectedScript;
}

function normalizeDotKey(key: string) {
  return key.startsWith('metadata.') ? key.slice('metadata.'.length).toLowerCase() : key.toLowerCase();
}

export function useSearch() {
  const { projectId, collectionId, manifestId } = useRouteContext();
  const { fulltext, appliedFacets, page } = useSearchQuery();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const {
    project: { searchStrategy, claimGranularity, searchOptions },
  } = useSiteConfiguration();
  const { searchMultipleFields, nonLatinFulltext, onlyShowManifests } = searchOptions || {};
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
          const keyToAdd = normalizeDotKey(key);
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
        projectId,
        collectionId,
        manifestId,
        fulltext: fulltext,
        facet_fields: facetsToRequest.length ? facetsToRequest : undefined,

        //  @todo stringify facets.
        facets: appliedFacets.map(facet => ({
          type: 'metadata',
          subtype: facet.k,
          value: facet.v,
        })),
        facet_on_manifests: true,
        search_type: searchStrategy as any,
        number_of_facets: searchFacetConfig.data?.facets.length ? 100 : undefined,
        iiif_type: claimGranularity === 'manifest' || onlyShowManifests ? 'Manifest' : undefined,
        non_latin_fulltext: nonLatinFulltext,
        search_multiple_fields: searchMultipleFields,
        // Request facets filtered by current language (if search service supports it)
        facet_languages: [currentLanguage, currentLanguage.split('-')[0]].filter((v, i, a) => a.indexOf(v) === i),
      },
      page,
    ],
    {
      enabled:
        !searchFacetConfig.isLoading &&
        (!!facetsToRequest.length || !!fulltext || fulltext === '' || collectionId || manifestId || projectId),
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
          });
        }
      } else {
        for (const field of fieldsToMap.keys) {
          const searchResultFacetValues = mappedSearchResponseMetadata[field];
          if (searchResultFacetValues) {
            // Filter facet values to only show those matching the current language's script
            const filteredValues = searchResultFacetValues.filter(fieldValue =>
              doesValueMatchLanguage(fieldValue.value, currentLanguage)
            );
            displayItem.items.push(
              ...filteredValues.map(fieldValue => ({
                label: { none: [fieldValue.value] },
                key: fieldValue.key,
                values: [fieldValue.value],
                count: fieldValue.count,
              }))
            );
          }
        }
      }
      // @todo fieldsToMap.config.value
      displayList.push(displayItem);
    }

    return displayList;
  }, [facetDisplayOrder, facetIdMap, searchResponse.resolvedData, currentLanguage]);

  return [searchResponse, displayFacets, searchFacetConfig.isLoading || searchResponse.isLoading] as const;
}
