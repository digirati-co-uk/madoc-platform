import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { Pagination } from '../../shared/components/Pagination';
import { useProjectList } from '../hooks/use-project-list';

export const AllProjectsPagination: React.FC = () => {
  const { latestData: data } = useProjectList();

  return (
    <Pagination
      page={data ? data.pagination.page : undefined}
      totalPages={data ? data.pagination.totalPages : undefined}
      stale={!data}
    />
  );
};

blockEditorFor(AllProjectsPagination, {
  type: 'default.AllProjectsPagination',
  label: 'All projects pagination',
  internal: true,
  source: {
    name: 'All projects page',
    type: 'custom-page',
    id: '/projects',
  },
  anyContext: [],
  requiredContext: [],
  editor: {},
});
