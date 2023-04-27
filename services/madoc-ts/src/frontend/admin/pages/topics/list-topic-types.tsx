import React from 'react';
import { LocaleString } from '../../../shared/components/LocaleString';
import { useRelativeLinks } from '../../../site/hooks/use-relative-links';
import { usePaginatedTopicTypes } from '../../../site/pages/loaders/topic-type-list-loader';
import { Heading3 } from '../../../shared/typography/Heading3';
import { Button } from '../../../shared/navigation/Button';
import { Link } from 'react-router-dom';
import { Pagination } from '../../molecules/Pagination';
import { ObjectContainer } from '../../../shared/atoms/ObjectContainer';

export function ListTopicTypes() {
  const createLink = useRelativeLinks(true);
  const { data } = usePaginatedTopicTypes();

  return (
    <>
      {data?.topicTypes.map(topicType => (
        <ObjectContainer $background={'#ECF5FC'} $radius={4} key={topicType.id}>
          <LocaleString as={Heading3}>{topicType.label || { en: ['...'] }}</LocaleString>
          <Button $primary as={Link} to={createLink({ topicType: topicType.slug })}>
            View Topic Type
          </Button>
        </ObjectContainer>
      ))}
      <Pagination
        page={data ? data.pagination.page : 1}
        totalPages={data ? data.pagination.totalPages : 1}
        stale={!data}
      />
    </>
  );
}
