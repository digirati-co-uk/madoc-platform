import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Pagination } from '../../shared/components/Pagination';
import { useCollectionList } from '../hooks/use-collection-list';

export const AllCollectionsPagination: React.FC = () => {
  const { latestData } = useCollectionList();

  return (
    <Pagination
      page={latestData ? latestData.pagination.page : 1}
      totalPages={latestData ? latestData.pagination.totalPages : 1}
      stale={!latestData}
    />
  );
};

blockEditorFor(AllCollectionsPagination, {
    type: 'default.AllCollectionsPagination',
    label: 'All collections pagination',
    internal: true,
    source: {
        name: 'All collections page',
        type: 'custom-page',
        id: '/collections',
    },
    anyContext: [],
    requiredContext: [],
    editor: {},
});
