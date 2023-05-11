import React from 'react';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useRelativeLinks } from '../../../../site/hooks/use-relative-links';
import { usePaginatedTopicTypes } from '../../../../site/pages/loaders/topic-type-list-loader';
import { Heading3 } from '../../../../shared/typography/Heading3';
import { Button } from '../../../../shared/navigation/Button';
import { Link } from 'react-router-dom';
import { Pagination } from '../../../molecules/Pagination';
import { ObjectContainer } from '../../../../shared/atoms/ObjectContainer';
import { useTranslation } from 'react-i18next';
import { AllTopicTypeItems } from '../../../../site/features/AllTopicTypeItems';
import { SnippetLarge } from '../../../../shared/atoms/SnippetLarge';

export function ListAllTopicTypes() {
  const { t } = useTranslation();
  const { data } = usePaginatedTopicTypes();

  return (
    <>
      <p>{data?.pagination.totalResults} total topic types</p>
      {data?.topicTypes.map(topicType => (
        <>
          <SnippetLarge
            key={topicType.id}
            label={<LocaleString>{topicType.title}</LocaleString>}
            link={topicType.slug}
            buttonText={t('View Topic Type')}
            subtitle={`${topicType.count} topics`}
            thumbnail={topicType.image_url}
            margin
          />
        </>
      ))}
      <Pagination
        page={data ? data.pagination.page : 1}
        totalPages={data ? data.pagination.totalPages : 1}
        stale={!data}
      />
    </>
  );
}
