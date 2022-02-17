import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { Pagination } from '../../shared/components/Pagination';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { useManifest } from '../hooks/use-manifest';
import { usePreventCanvasNavigation } from './PreventUsersNavigatingCanvases';

export const ManifestPagination: React.FC = () => {
  const { data } = useManifest();
  const { filter, listing } = useLocationQuery();
  const { showNavigationContent } = usePreventCanvasNavigation();

  const pagination = data?.pagination;

  if (!pagination || !showNavigationContent) {
    return null;
  }

  return (
    <Pagination
      hash={'listing-header'}
      pageParam={'m'}
      page={pagination ? pagination.page : 1}
      totalPages={pagination ? pagination.totalPages : 1}
      stale={!pagination}
      extraQuery={{ filter, listing }}
    />
  );
};

blockEditorFor(ManifestPagination, {
  type: 'default.ManifestPagination',
  label: 'Manifest pagination',
  anyContext: ['manifest'],
  requiredContext: ['manifest'],
  editor: {},
});
