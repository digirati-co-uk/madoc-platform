import React from 'react';
import { EnrichmentEntitySnippet } from '../../../../../extensions/enrichment/authority/types';
import { DjangoPagination } from '../../../../../extensions/enrichment/types';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { useTranslation } from 'react-i18next';
import { SnippetLarge } from '../../../../shared/atoms/SnippetLarge';

export function ListAllTopics() {
  const { t } = useTranslation();
  const { data } = usePaginatedData<DjangoPagination<EnrichmentEntitySnippet>>(ListAllTopics);
  return (
    <>
      <p>{data?.count} total topics</p>
      <>
        {data?.results.map(topic => (
          <SnippetLarge
            key={topic.id}
            label={topic.label}
            link={topic.type?.label}
            buttonText={t('View Topic')}
            hideButton={!topic.type}
            subtitle={`${topic.count} resources tagged`}
            thumbnail={topic.image_url}
            margin
          />
        ))}
      </>
    </>
  );
}

serverRendererFor(ListAllTopics, {
  getKey(params, query) {
    return ['authority.entity.list', { page: query.page || 1 }];
  },
  getData(key: string, vars, api) {
    return api.authority.entity.list(vars.page);
  },
});
