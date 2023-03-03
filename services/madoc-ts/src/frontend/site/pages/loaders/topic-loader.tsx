import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { Topic } from '../../../../types/schemas/topics';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';

export type TopicLoaderType = {
  params: { topicType: string; topic: string };
  variables: { topicType: string; topic: string; page?: number };
  query: unknown;
  data: Topic;
};

export function useTopic() {
  return useStaticData(
    TopicLoader,
    {},
    {
      cacheTime: 1000 * 60 * 60,
      staleTime: 0,
    }
  );
}

export const TopicLoader: UniversalComponent<TopicLoaderType> = createUniversalComponent<TopicLoaderType>(
  () => {
    const { data } = useTopic();

    const ctx = useMemo(() => (data ? { id: data.slug, name: data.title } : undefined), [data]);

    return (
      <BreadcrumbContext topic={ctx}>
        <Outlet />
      </BreadcrumbContext>
    );
  },
  {
    getKey: params => {
      return ['site-topic', { topicType: params.topicType, topic: params.topic }];
    },
    getData: async (key, vars, api) => {
      return api.enrichment.getSiteTopic(vars.topicType, vars.topic);
    },
  }
);
