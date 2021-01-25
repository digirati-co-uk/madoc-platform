import React from 'react';
import { Pagination } from '../../shared/components/Pagination';
import { useCollectionList } from '../hooks/use-collection-list';

export const CollectionPagination: React.FC = () => {
  const { latestData } = useCollectionList();

  return (
    <Pagination
      page={latestData ? latestData.pagination.page : 1}
      totalPages={latestData ? latestData.pagination.totalPages : 1}
      stale={!latestData}
    />
  );
};
