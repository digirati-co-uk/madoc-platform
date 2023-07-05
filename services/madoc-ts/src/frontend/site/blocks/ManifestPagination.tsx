import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Pagination, PaginationNumbered } from '../../shared/components/Pagination';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { useManifest } from '../hooks/use-manifest';
import { usePreventCanvasNavigation } from '../hooks/use-prevent-canvas-navigation';
import { useRouteContext } from '../hooks/use-route-context';

export const ManifestPagination: React.FC<{
  paginationStyle?: boolean;
  position?: 'flex-end' | 'flex-start' | 'center';
}> = ({ paginationStyle, position }) => {
  const { data } = useManifest();
  const { filter, listing } = useLocationQuery();
  const { showNavigationContent } = usePreventCanvasNavigation();
  const { canvasId } = useRouteContext();

  const pagination = data?.pagination;
  const PaginationComponent = paginationStyle ? PaginationNumbered : Pagination;

  if (!pagination || !showNavigationContent || canvasId) {
    return null;
  }

  return (
    <PaginationComponent
      position={position}
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
  defaultProps: {
    paginationStyle: false,
    position: 'flex-end',
  },
  editor: {
    paginationStyle: {
      type: 'checkbox-field',
      inlineLabel: 'Pagination as Numbered?',
      label: 'Pagination Numbered',
    },
    position: {
      label: 'Position',
      type: 'dropdown-field',
      options: [
        { value: 'flex-start', text: 'Start' },
        { value: 'center', text: 'Center' },
        { value: 'flex-end', text: 'End' },
      ],
    },
  },
});
