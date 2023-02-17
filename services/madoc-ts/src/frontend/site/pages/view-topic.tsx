import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Pagination } from '../../shared/components/Pagination';
import { SearchResults } from '../../shared/components/SearchResults';
import { useTopicItems } from '../../shared/hooks/use-topic-items';
import { Slot } from '../../shared/page-blocks/slot';
import { TopicHero } from '../features/TopicHero';
import { useParams } from 'react-router-dom';

export function ViewTopic() {
  const { topic } = useParams<Record<'topic', any>>();
  const [search, { query, page }] = useTopicItems(topic);

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="topic-header">
        <TopicHero />
      </Slot>

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
        {/*<pre>{JSON.stringify(search.data, null, 2)}</pre>*/}
      </div>
    </>
  );
}
