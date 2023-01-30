import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Slot } from '../../shared/page-blocks/slot';
import { TopicTypeHero } from '../features/TopicTypeHero';
import { TopicGrid } from '../features/TopicGrid';
import { Pagination } from '../../shared/components/Pagination';
import { useTopicType } from './loaders/topic-type-loader';

export function ViewTopicType() {
  const { data } = useTopicType();

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="topic-type-hero">
        <TopicTypeHero />
      </Slot>

      <Slot name="topic-type-topics">
        <TopicGrid />
      </Slot>

      <Slot name="topic-type-pagination">
        <Pagination
          page={data?.pagination ? data.pagination.page : 1}
          totalPages={data?.pagination ? data.pagination.totalPages : 1}
          stale={false}
        />
      </Slot>

      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
    </>
  );
}
