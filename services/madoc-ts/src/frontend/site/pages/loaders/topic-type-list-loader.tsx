import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopicTypeListResponse } from '../../../../types/schemas/topics';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../../shared/hooks/use-data';

export type TopicTypeListLoaderType = {
  params: unknown;
  variables: { page: number };
  query: { page?: string };
  data: TopicTypeListResponse;
};

export function usePaginatedTopicTypes() {
  return usePaginatedData(TopicTypeListLoader);
}

export const TopicTypeListLoader: UniversalComponent<TopicTypeListLoaderType> = createUniversalComponent<
  TopicTypeListLoaderType
>(
  () => {
    usePaginatedTopicTypes();

    return <Outlet />;
  },
  {
    getKey: (params, query) => {
      return ['site-topic-types-list', { page: Number(query.page) || 1 }];
    },
    getData: (key, vars, api) => {
      return api.getSiteTopicTypes(vars.page);
    },
  }
);
