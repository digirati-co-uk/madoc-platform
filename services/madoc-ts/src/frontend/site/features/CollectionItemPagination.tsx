import React from 'react';
import { Pagination } from '../../shared/components/Pagination';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { CollectionLoader } from '../pages/loaders/collection-loader';

export const CollectionItemPagination = () => {
  const { data } = usePaginatedData(CollectionLoader);
  const { filter } = useLocationQuery();
  const pagination = data ? data.pagination : undefined;

  return (
    <Pagination
      pageParam={'c'}
      page={pagination ? pagination.page : undefined}
      totalPages={pagination ? pagination.totalPages : undefined}
      stale={!pagination}
      extraQuery={{ filter }}
    />
  );
};
