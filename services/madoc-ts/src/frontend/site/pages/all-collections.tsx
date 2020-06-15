import React from 'react';
import { Pagination as PaginationType } from '../../../types/schemas/_pagination';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { LocaleString } from '../../shared/components/LocaleString';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';

type AllCollectionsType = {
  params: { projectId?: string };
  query: { page: string };
  variables: { projectId?: number; page: number };
  data: { collections: any[]; pagination: PaginationType };
};

const links = {
  collection(collectionId: number, projectId?: number) {
    if (projectId) {
      return `/projects/${projectId}/collections/${collectionId}`;
    }
    return `/collections/${collectionId}`;
  },
};

export const AllCollections: UniversalComponent<AllCollectionsType> = createUniversalComponent<AllCollectionsType>(
  () => {
    const { resolvedData: data, latestData } = usePaginatedData(AllCollections);

    if (!data) {
      return <>loading...</>;
    }

    return (
      <div>
        <h1>All collections</h1>
        {data.collections.map(collection => {
          return (
            <div key={collection.id}>
              <Link to={links.collection(collection.id)}>
                <LocaleString>{collection.label}</LocaleString>
              </Link>
            </div>
          );
        })}
        <Pagination
          page={latestData ? latestData.pagination.page : 1}
          totalPages={latestData ? latestData.pagination.totalPages : 1}
          stale={!latestData}
        />
      </div>
    );
  },
  {
    getKey: (params, query) => {
      return ['site-collections', { page: Number(query.page) || 1 }];
    },
    getData: (key, variables, api) => {
      return api.getSiteCollections(variables);
    },
  }
);
