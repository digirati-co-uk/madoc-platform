import React, { useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { TopicType } from '../../../../types/schemas/topics';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';

export type TaskLoaderType = {
  params: { topicType: string };
  variables: { topicType: string; page: number };
  query: { page?: string };
  data: TopicType;
};

export function useTopicType() {
  const params = useParams<{ topicType?: string }>();
  return usePaginatedData(TopicTypeLoader, undefined, { enabled: params.topicType && params.topicType !== '_' });
}

export const TopicTypeLoader: UniversalComponent<TaskLoaderType> = createUniversalComponent<TaskLoaderType>(
  () => {
    const { data } = useTopicType();

    const ctx = useMemo(() => (data ? { id: data.slug, name: data.label } : { id: '', name: { none: ['...'] } }), [
      data,
    ]);

    return (
      <BreadcrumbContext topicType={ctx}>
        <Outlet />
      </BreadcrumbContext>
    );
  },
  {
    getKey: (params, query) => {
      return ['site-topic-type', { topicType: params.topicType, page: Number(query.page) || 1 }];
    },
    getData: async (key, vars, api) => {
      return api.enrichment.getSiteTopicType(vars.topicType, vars.page);
    },
  }
);
