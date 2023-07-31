import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Pagination } from '../../shared/components/Pagination';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { usePaginatedCollection } from '../hooks/use-paginated-collection';

export const CollectionItemPagination = () => {
  const { data } = usePaginatedCollection();
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

blockEditorFor(CollectionItemPagination, {
  type: 'default.CollectionItemPagination',
  label: 'Collection pagination',
  anyContext: ['collection'],
  requiredContext: ['collection'],
  editor: {},
});
