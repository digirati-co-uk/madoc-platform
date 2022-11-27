import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { LocaleString } from '../../shared/components/LocaleString';
import { Pagination } from '../../shared/components/Pagination';
import { Slot } from '../../shared/page-blocks/slot';
import { Heading1 } from '../../shared/typography/Heading1';
import { HrefLink } from '../../shared/utility/href-link';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { usePaginatedTopicTypes } from './loaders/topic-type-list-loader';

export function ViewTopicTypes() {
  const createLink = useRelativeLinks();
  const { data } = usePaginatedTopicTypes();

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs topicRoot />
      </Slot>

      {/* Custom slots.. */}
      <Heading1>Topic types</Heading1>
      <ul>
        {data?.topicTypes.map(topicType => (
          <li key={topicType.id}>
            <HrefLink href={createLink({ topicType: topicType.slug })}>
              <LocaleString>{topicType.label}</LocaleString>
            </HrefLink>
          </li>
        ))}
      </ul>

      <Pagination
        pageParam={'page'}
        page={data?.pagination ? data.pagination.page : 1}
        totalPages={data?.pagination ? data.pagination.totalPages : 1}
        stale={!data?.pagination}
      />

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
