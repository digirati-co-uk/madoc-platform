import React from 'react';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { usePaginatedTopicTypes } from '../../../../site/pages/loaders/topic-type-list-loader';
import { Pagination } from '../../../molecules/Pagination';
import { useTranslation } from 'react-i18next';
import { SnippetLarge } from '../../../../shared/atoms/SnippetLarge';

export function ListAllTopicTypes() {
  const { t } = useTranslation();
  const { data } = usePaginatedTopicTypes();
  return (
    <>
      <p>
        {data?.pagination.totalResults} {t('total topic types')}
      </p>
      {data?.results.map(topicType => (
        <SnippetLarge
          key={topicType.id}
          label={<LocaleString>{topicType.title}</LocaleString>}
          link={topicType.slug}
          buttonText={t('View Topic type')}
          subtitle={`${topicType.topic_count} ${t('topics')}`}
          thumbnail={topicType.other_data?.thumbnail?.url}
          margin
        />
      ))}
      <Pagination
        page={data ? data.pagination.page : 1}
        totalPages={data ? data.pagination.totalPages : 1}
        stale={!data}
      />
    </>
  );
}
