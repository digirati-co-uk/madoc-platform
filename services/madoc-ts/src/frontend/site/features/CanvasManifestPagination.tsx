import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { CanvasNavigationMinimalist } from '../../shared/components/CanvasNavigationMinimalist';
import { useCanvasSearch } from '../../shared/hooks/use-canvas-search';
import { useRouteContext } from '../hooks/use-route-context';

export const CanvasManifestPagination: React.FC<{ subRoute?: string }> = ({ subRoute }) => {
  const { manifestId, collectionId, canvasId, projectId } = useRouteContext();
  const [searchText] = useCanvasSearch(canvasId);

  if (!canvasId || !manifestId) {
    return null;
  }

  return (
    <CanvasNavigationMinimalist
      manifestId={manifestId}
      canvasId={canvasId}
      projectId={projectId}
      collectionId={collectionId}
      query={searchText ? { searchText } : undefined}
      subRoute={subRoute}
    />
  );
};

blockEditorFor(CanvasManifestPagination, {
  type: 'default.CanvasManifestPagination',
  label: 'Canvas manifest navigation',
  anyContext: ['canvas'],
  requiredContext: ['canvas'],
  editor: {},
});
