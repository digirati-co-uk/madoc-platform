import { stringify } from 'query-string';
import React, { useState, useEffect } from 'react';
import { SearchResults } from '../../shared/components/SearchResults';
import { SearchFacets } from '../../shared/components/SearchFacets';

import { PaginationNumbered } from '../../shared/components/Pagination';
import { useTranslation } from 'react-i18next';
import { useLocationQuery } from '../../shared/hooks/use-location-query';

import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../frontend/types';

import { useHistory, useLocation } from 'react-router-dom';
import { usePaginatedData } from '../../shared/hooks/use-data';

import styled from 'styled-components';

import { SearchResponse, SearchFacet } from '../../../types/search';

// This is on pause until we get a drive from users
// const options = [
//   { value: 'Option1', text: 'Option 1' },
//   { value: 'Option2', text: 'Option 2' },
//   { value: 'Option3', text: 'Option 3' },
// ];

const SearchContainer = styled.div`
  display: flex;
`;

type SearchListType = {
  data: SearchResponse | undefined;
  params: {};
  query: { page: number; fulltext: string };
  variables: { page: number; fulltext: string; facets?: string; madoc_id?: string };
};

export const Search: UniversalComponent<SearchListType> = createUniversalComponent<SearchListType>(
  () => {
    const { status, data } = usePaginatedData(Search);
    const { t } = useTranslation();
    const { page, fulltext, facets, madoc_id } = useLocationQuery();
    const history = useHistory();
    const { pathname } = useLocation();

    const initaliseAppliedFacets = () => {
      if (facets && facets !== 'undefined') {
        return JSON.parse(facets).map((facet: any) => {
          return {
            ...facet,
            applied: true,
          };
        });
      } else {
        return [];
      }
    };

    const [appliedFacets, setAppliedFacets] = useState(initaliseAppliedFacets());
    const [facetOptions, setFacetOptions] = useState<SearchFacet[]>([]);

    const manageFacet = (facetType: string, facetValue: string) => {
      const facet = {
        type: 'metadata',
        subtype: facetType,
        value: facetValue,
      };

      if (!appliedFacets.find((fac: any) => fac.value === facet.value)) {
        const newappliedFacets = [...appliedFacets];
        newappliedFacets.push(facet);
        setAppliedFacets(newappliedFacets);
      } else if (appliedFacets.find((fac: any) => fac.value === facet.value)) {
        const newappliedFacets = appliedFacets.filter(
          (fac: any) => fac.value === facet.value && fac.facetType === facet.subtype
        );
        setAppliedFacets(newappliedFacets);
      }
    };

    const mapFacets = () => {
      const options = [];
      if (data && data.facets && data.facets.metadata) {
        for (const [key, value] of Object.entries(data.facets.metadata)) {
          const subtype = key;
          for (const [k] of Object.entries(value)) {
            options.push({
              type: 'metadata',
              subtype: subtype,
              value: k,
              applied: appliedFacets.find((option: any) => option.subtype === subtype && option.value === k)
                ? true
                : false,
            });
          }
        }
      }
      setFacetOptions(options);
    };

    useEffect(() => {
      mapFacets();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, appliedFacets]);

    useEffect(() => {
      const jsonFacets = JSON.stringify(appliedFacets);
      if (appliedFacets && appliedFacets.length >= 1) {
        history.push(`${pathname}?${stringify({ fulltext, page, madoc_id })}&facets=${jsonFacets}`);
      } else {
        history.push(`${pathname}?${stringify({ fulltext, page, madoc_id })}`);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const applyFacets = () => {
      const jsonFacets = JSON.stringify(appliedFacets);
      if (appliedFacets && appliedFacets.length >= 1) {
        history.push(`${pathname}?${stringify({ fulltext, page: 1, madoc_id })}&facets=${jsonFacets}`);
      } else {
        history.push(`${pathname}?${stringify({ fulltext, page: 1, madoc_id })}`);
      }
    };

    const clearFacets = () => {
      setAppliedFacets([]);
      history.push(`${pathname}?${stringify({ fulltext, page: 1, madoc_id })}`);
    };

    return status === 'loading' ? (
      <div>{t('Loading')}</div>
    ) : (
      <>
        <SearchContainer>
          <SearchFacets
            facets={facetOptions}
            facetChange={(facetType, facetValue) => manageFacet(facetType, facetValue)}
            applyFilters={applyFacets}
            clearFilters={clearFacets}
          />
          <SearchResults
            searchFunction={val => {
              history.push(
                `${pathname}?${stringify({ fulltext: val, page, madoc_id })}&facets=${JSON.stringify(appliedFacets)}`
              );
            }}
            value={fulltext}
            totalResults={data && data.pagination ? data.pagination.totalResults : 0}
            searchResults={data ? data.results : []}
            sortByFunction={val => {
              // alert('you sorted by:  ' + val);
            }}
          />
        </SearchContainer>
        <PaginationNumbered
          page={data && data.pagination ? data.pagination.page : 1}
          totalPages={data && data.pagination ? data.pagination.totalPages : 1}
          stale={false}
          extraQuery={{ fulltext }}
        />
      </>
    );
  },
  {
    getKey(params: {}, query: { page: number; fulltext: string; facets?: string; madoc_id?: string }) {
      return [
        'response',
        { page: query.page ? Number(query.page) : 1, fulltext: query.fulltext, facets: query.facets },
      ];
    },
    getData: async (key, vars, api) => {
      if (!vars.fulltext) {
        return undefined;
      }

      return await api.searchQuery(
        {
          fulltext: vars.fulltext,
          facets: vars.facets,
        },
        vars.page,
        vars.madoc_id
      );
    },
  }
);
