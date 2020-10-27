import { stringify } from 'query-string';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useHistory, useLocation } from 'react-router-dom';
import { SearchResults } from '../../shared/components/SearchResults';
import { SearchFacets } from '../../shared/components/SearchFacets';
import { PaginationNumbered } from '../../shared/components/Pagination';
import { useTranslation } from 'react-i18next';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../types';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { SearchResponse, SearchFacet } from '../../../types/search';

const SearchContainer = styled.div`
  display: flex;
`;

type SearchListType = {
  data: {
    searchResponse: SearchResponse | undefined;
    facets:
      | {
          [key: string]: string[];
        }
      | undefined;
  };
  params: {};
  query: { page: number; fulltext: string };
  variables: { page: number; fulltext: string; facets?: { [key: string]: string[] }; madoc_id?: string };
};

export const parseFacets = (facetStr: string | undefined): { [key: string]: string[] } | undefined => {
  if (!facetStr) {
    return undefined;
  }

  try {
    return (JSON.parse(facetStr) as any) as any;
  } catch (err) {
    return undefined;
  }
};

export const stringifyFacets = (facets: { [key: string]: string[] }): SearchFacet[] => {
  const options = [];
  if (facets) {
    const facetKeys = Object.keys(facets);

    for (const facetKey of facetKeys) {
      const facetArray = Array.isArray(facets[facetKey]) ? facets[facetKey] : [facets[facetKey]];
      for (const facetValue of facetArray as string[]) {
        options.push({
          type: 'metadata',
          subtype: facetKey,
          value: facetValue,
        });
      }
    }
  }
  return options;
};

export const Search: UniversalComponent<SearchListType> = createUniversalComponent<SearchListType>(
  () => {
    const { status, data } = usePaginatedData(Search);
    const { t } = useTranslation();
    const { page, fulltext, madoc_id } = useLocationQuery();
    const history = useHistory();
    const { pathname } = useLocation();
    const { searchResponse, facets } = data || {};

    const facetOptions = useMemo(() => {
      const options = [];
      if (searchResponse && searchResponse.facets && searchResponse.facets.metadata) {
        for (const [key, value] of Object.entries(searchResponse.facets.metadata)) {
          const subtype = key;
          for (const [k] of Object.entries(value as any)) {
            options.push({
              type: 'metadata',
              subtype: subtype,
              value: k,
              applied: facets && facets[subtype] && facets[subtype].indexOf(k) !== -1,
            });
          }
        }
      }

      return options;
    }, [facets, searchResponse]);

    const applyFacet = (type: string, value: string) => {
      if (data) {
        history.push(
          `${pathname}?${stringify({
            fulltext,
            page: 1,
            madoc_id,
            facets: JSON.stringify({ ...(facets || {}), [type]: value }),
          })}`
        );
      }
    };

    return status === 'loading' ? (
      <div>{t('Loading')}</div>
    ) : (
      <>
        <SearchContainer>
          <SearchFacets
            facets={facetOptions}
            facetChange={(facetType, facetValue) => applyFacet(facetType, facetValue)}
          />
          <SearchResults
            searchFunction={val => {
              history.push(
                `${pathname}?${stringify({
                  fulltext: val,
                  page,
                  madoc_id,
                  facets: facets ? JSON.stringify(facets) : undefined,
                })}`
              );
            }}
            value={fulltext}
            totalResults={searchResponse && searchResponse.pagination ? searchResponse.pagination.totalResults : 0}
            searchResults={searchResponse ? searchResponse.results : []}
            sortByFunction={() => {
              // alert('you sorted by:  ' + val);
            }}
          />
        </SearchContainer>
        <PaginationNumbered
          page={searchResponse && searchResponse.pagination ? searchResponse.pagination.page : 1}
          totalPages={searchResponse && searchResponse.pagination ? searchResponse.pagination.totalPages : 1}
          stale={false}
          extraQuery={{ fulltext, madoc_id, facets: facets ? JSON.stringify(facets) : undefined }}
        />
      </>
    );
  },
  {
    getKey(params: {}, query: { page: number; fulltext: string; facets?: string; madoc_id?: string }) {
      return [
        'site-search',
        {
          page: query.page ? Number(query.page) : 1,
          fulltext: query.fulltext,
          facets: parseFacets(query.facets),
          madoc_id: query.madoc_id,
        },
      ];
    },
    getData: async (key, vars, api) => {
      if (!vars.fulltext && !vars.madoc_id && !vars.facets) {
        return {
          searchResponse: undefined,
          facets: vars.facets,
        };
      }

      const searchResponse = await api.searchQuery(
        {
          fulltext: vars.fulltext,
          facets: stringifyFacets({ ...vars.facets }) as any,
        },
        vars.page,
        vars.madoc_id
      );

      return {
        searchResponse,
        facets: vars.facets,
      };
    },
  }
);
