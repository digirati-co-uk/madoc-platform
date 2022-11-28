import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { LocaleString } from '../../shared/components/LocaleString';
import { Pagination } from '../../shared/components/Pagination';
import { SearchResults } from '../../shared/components/SearchResults';
import { useTopicItems } from '../../shared/hooks/use-topic-items';
import { Slot } from '../../shared/page-blocks/slot';
import { Heading1, Subheading1 } from '../../shared/typography/Heading1';
import { useTopic } from './loaders/topic-loader';
import { useTopicType } from './loaders/topic-type-loader';

export function ViewTopic() {
  const { data: topicType } = useTopicType();
  const { data } = useTopic();
  const [search, { query, page }] = useTopicItems();

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      {/* Custom slots.. */}
      <Heading1 as={LocaleString}>{data?.label || { none: ['...'] }}</Heading1>
      {topicType ? <Subheading1 as={LocaleString}>{topicType?.label || { none: ['...'] }}</Subheading1> : null}
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <div>
        <h3>Items in this topic</h3>
        <Pagination
          page={page}
          totalPages={
            search.latestData && search.latestData.pagination ? search.latestData.pagination.totalPages : undefined
          }
          stale={search.isLoading}
          extraQuery={query}
        />
        <SearchResults admin searchResults={search.data?.results || []} />
        <Pagination
          page={page}
          totalPages={
            search.latestData && search.latestData.pagination ? search.latestData.pagination.totalPages : undefined
          }
          stale={search.isLoading}
          extraQuery={query}
        />
        <pre>{JSON.stringify(search.data, null, 2)}</pre>
      </div>
    </>
  );
}
