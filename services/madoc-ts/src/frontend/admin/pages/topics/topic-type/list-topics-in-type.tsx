import React from 'react';
import { HrefLink } from '../../../../shared/utility/href-link';
import { useRelativeLinks } from '../../../../site/hooks/use-relative-links';
import { useTopicType } from '../../../../site/pages/loaders/topic-type-loader';
import { TopicSnippetCard } from '../../../../shared/components/TopicSnippet';
import { Heading3, Subheading3 } from '../../../../shared/typography/Heading3';
import { Pagination } from '../../../../shared/components/Pagination';
import { useTranslation } from 'react-i18next';

export function ListTopicsInType() {
  const createLink = useRelativeLinks(true);
  const { data } = useTopicType();
  const { t } = useTranslation();
  return (
    <>
      <Heading3> {t('Topics in this type')}:</Heading3>
      <Pagination
        page={data?.pagination ? data?.pagination.page : 1}
        totalPages={data?.pagination ? data?.pagination.totalPages : 1}
        stale={!data?.pagination}
      />
      {data?.pagination.totalResults === 0 && <Subheading3>{t('No topics in this type')}</Subheading3>}
      {data?.topics.map(topic => (
        <HrefLink href={createLink({ topic: topic.slug })} key={topic.id}>
          <TopicSnippetCard topic={topic} cardBorder="black" size={'small'} />
        </HrefLink>
      ))}
    </>
  );
}
