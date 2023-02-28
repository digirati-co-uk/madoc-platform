import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Pagination } from '../../shared/components/Pagination';
import { SearchResults } from '../../shared/components/SearchResults';
import { useTopicItems } from '../../shared/hooks/use-topic-items';
import { Slot } from '../../shared/page-blocks/slot';
import { TopicHero } from '../features/TopicHero';
import { useParams } from 'react-router-dom';
import { FeaturedTopicItems } from '../features/FeaturedTopicItems';
import { StaticPage } from '../features/StaticPage';

export function ViewTopic() {
  const { topic } = useParams<Record<'topic', any>>();
  const [search, { query, page }] = useTopicItems(topic);

  return (
    <StaticPage title="topic">
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="topic-header">
        <TopicHero />
      </Slot>

      <Slot name="topic-featured">
        <FeaturedTopicItems />
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
      </div>

      <Slot name="topic-related">
        {/*<RelatedTopicItems />*/}
      </Slot>
    </StaticPage>
  );
}
