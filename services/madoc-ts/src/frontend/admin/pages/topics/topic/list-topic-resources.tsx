import React from 'react';

import { Pagination } from '../../../../shared/components/Pagination';
import { SearchResults } from '../../../../shared/components/SearchResults';
import { useTopicItems } from '../../../../shared/hooks/use-topic-items';
import { EmptyState } from '../../../../shared/layout/EmptyState';

import { useParams } from 'react-router-dom';
import { useTopic } from '../../../../site/pages/loaders/topic-loader';
import { Subheading } from '@storybook/addon-docs';
import { Heading2 } from '../../../../shared/typography/Heading2';

export function ListTopicResources() {
  // const { topic } = useParams<Record<'topic', any>>();
  // const { topicType } = useParams<Record<'topicType', any>>();
  const { data: topic } = useTopic();
  const [{ data, isLoading, latestData }, { query, page }] = useTopicItems(topic?.id);

  if (data?.pagination.totalResults === 0) {
    return <EmptyState>Nothing tagged yet</EmptyState>;
  }

  return (
    <div>
      <p>Items : {data?.pagination.totalResults}</p>
      <Pagination
        page={page}
        totalPages={latestData && latestData.pagination ? latestData.pagination.totalPages : undefined}
        stale={isLoading}
        extraQuery={query}
      />
      <SearchResults admin searchResults={data?.results || []} />
      <Pagination
        page={page}
        totalPages={latestData && latestData.pagination ? latestData.pagination.totalPages : undefined}
        stale={isLoading}
        extraQuery={query}
      />
    </div>
  );
}
