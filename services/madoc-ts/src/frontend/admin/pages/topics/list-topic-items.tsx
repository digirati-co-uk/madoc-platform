import React from 'react';

import { Pagination } from '../../../shared/components/Pagination';
import { SearchResults } from '../../../shared/components/SearchResults';
import { useTopicItems } from '../../../shared/hooks/use-topic-items';
import { EmptyState } from '../../../shared/layout/EmptyState';
import { useParams } from 'react-router-dom';

export function ListTopicItems() {
  const { topic } = useParams<Record<'topic', any>>();
  const [{ data, isLoading, latestData }, { query, page }] = useTopicItems(topic);

  console.log(query, 'd')
  if (data?.pagination.totalResults === 0) {
    return <EmptyState>Nothing tagged yet</EmptyState>;
  }

  return (
    <div>
      Items : {data?.pagination.totalResults}
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
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
