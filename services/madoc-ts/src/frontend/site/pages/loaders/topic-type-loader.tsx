import React, { useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { TopicType } from '../../../../types/schemas/topics';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { AutoSlotLoader } from '../../../shared/page-blocks/auto-slot-loader';

export type TopicTypeLoaderType = {
  params: { topicType: string };
  variables: { topicType: string; page: number; order_by: string };
  query: { page?: string; order_by: string };
  data: TopicType;
};

export function useTopicType() {
  const params = useParams<{ topicType?: string; order_by?: string }>();
  return usePaginatedData(TopicTypeLoader, undefined, {
    enabled: params.topicType && params.topicType !== '_',
  });
}

export const TopicTypeLoader: UniversalComponent<TopicTypeLoaderType> = createUniversalComponent<TopicTypeLoaderType>(
  () => {
    const { data } = useTopicType();

    const ctx = useMemo(() => (data ? { id: data.slug, name: data.label } : undefined), [data]);

    return (
      <AutoSlotLoader>
        <BreadcrumbContext topicType={ctx}>
          <Outlet />
        </BreadcrumbContext>
      </AutoSlotLoader>
    );
  },
  {
    getKey: (params, query) => {
      return [
        'site-topic-type',
        { topicType: params.topicType, page: Number(query.page) || 1, order_by: query.order_by || '' },
      ];
    },
    getData: async (key, vars, api) => {
      return await api.getSiteTopicType(vars.topicType, vars.page, vars.order_by);
    },
  }
);
