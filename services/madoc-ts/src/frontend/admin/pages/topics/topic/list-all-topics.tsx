import React from 'react';
import { EntitiesMadocResponse } from '../../../../../extensions/enrichment/authority/types';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { useTranslation } from 'react-i18next';
import { SnippetLarge } from '../../../../shared/atoms/SnippetLarge';
import { Pagination } from '../../../molecules/Pagination';

export function ListAllTopics() {
  const { t } = useTranslation();
  const { data } = usePaginatedData<EntitiesMadocResponse>(ListAllTopics);

  return (
    <>
      <p>
        {data?.pagination.totalResults} {t('total topics')}
      </p>
      <>
        {data?.results.map(topic => (
          <SnippetLarge
            key={topic.id}
            label={topic.label}
            link={`${topic.type_slug}/${topic.slug}`}
            buttonText={t('View Topic')}
            hideButton={!topic.type}
            subtitle={`${topic.tagged_resource_count} ${t('resources tagged')}`}
            thumbnail={topic.other_data.thumbnail.url}
            margin
            fluid
          />
        ))}
      </>
      <Pagination
        page={data ? data.pagination.page : 1}
        totalPages={data ? data.pagination.totalPages : 1}
        stale={!data}
      />
    </>
  );
}

serverRendererFor(ListAllTopics, {
  getKey(params, query) {
    return ['authority.entity.list', { page: query.page || 1 }];
  },
  getData(key: string, vars, api) {
    return api.authority.getAllEntities(vars.page);
  },
});