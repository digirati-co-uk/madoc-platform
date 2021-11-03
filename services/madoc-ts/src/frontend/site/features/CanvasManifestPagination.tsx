import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { CanvasNavigationMinimalist } from '../../shared/components/CanvasNavigationMinimalist';
import { useCanvasSearch } from '../../shared/hooks/use-canvas-search';
import { usePrefetchData } from '../../shared/hooks/use-data';
import { useSlots } from '../../shared/page-blocks/slot-context';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasLoader } from '../pages/loaders/canvas-loader';

export const CanvasManifestPagination: React.FC<{ subRoute?: string }> = ({ subRoute }) => {
  const { manifestId, collectionId, canvasId, projectId } = useRouteContext();
  const [searchText] = useCanvasSearch(canvasId);
  const prefetch = usePrefetchData(CanvasLoader);
  const createLink = useRelativeLinks();
  const { push } = useHistory();
  const { context } = useSlots();

  const beforeNavigate = useCallback(
    async (newCanvasId: number) => {
      console.log('PREFETCH');
      await prefetch([newCanvasId], { ...context, canvas: newCanvasId });
      push(createLink({ canvasId: newCanvasId, subRoute, query: searchText ? { searchText } : undefined }));
    },
    [context, createLink, prefetch, push]
  );

  if (!canvasId || !manifestId) {
    return null;
  }

  return (
    <CanvasNavigationMinimalist
      handleNavigation={beforeNavigate}
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
