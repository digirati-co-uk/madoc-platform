import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Pagination } from '../../shared/components/Pagination';
import { useManifestList } from '../hooks/use-manifest-list';

export const AllManifestsPagination: React.FC = () => {
  const { latestData } = useManifestList();

  return (
    <Pagination
      page={latestData ? latestData.pagination.page : 1}
      totalPages={latestData ? latestData.pagination.totalPages : 1}
      stale={!latestData}
    />
  );
};

blockEditorFor(AllManifestsPagination, {
    type: 'default.AllManifestsPagination',
    label: 'All manifests pagination',
    internal: true,
    source: {
        name: 'All manifests page',
        type: 'custom-page',
        id: '/manifests',
    },
    anyContext: [],
    requiredContext: [],
    editor: {},
});
