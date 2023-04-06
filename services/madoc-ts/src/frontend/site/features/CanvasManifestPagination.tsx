import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CanvasNavigationMinimalist } from '../../shared/components/CanvasNavigationMinimalist';
import { useCanvasSearch } from '../../shared/hooks/use-canvas-search';
import { usePrefetchData } from '../../shared/hooks/use-data';
import { useSlots } from '../../shared/page-blocks/slot-context';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasLoader } from '../pages/loaders/canvas-loader';

export const CanvasManifestPagination: React.FC<{ subRoute?: string; size?: string | undefined }> = ({
  subRoute,
  size,
}) => {
  const { manifestId, collectionId, canvasId, projectId } = useRouteContext();
  const [searchText] = useCanvasSearch(canvasId);
  const prefetch = usePrefetchData(CanvasLoader);
  const createLink = useRelativeLinks();
  const navigate = useNavigate();
  const { context } = useSlots();

  const beforeNavigate = useCallback(
    async (newCanvasId: number) => {
      await prefetch([newCanvasId], { ...context, canvas: newCanvasId });
      navigate(
        createLink({ canvasId: newCanvasId, subRoute, hash: 'canvas', query: searchText ? { searchText } : undefined })
      );
    },
    [context, createLink, prefetch, navigate]
  );

  if (!canvasId || !manifestId) {
    return null;
  }

  return (
    <CanvasNavigationMinimalist
      hash="canvas"
      handleNavigation={beforeNavigate}
      manifestId={manifestId}
      canvasId={canvasId}
      projectId={projectId}
      collectionId={collectionId}
      query={searchText ? { searchText } : undefined}
      subRoute={subRoute}
      size={size}
    />
  );
};

blockEditorFor(CanvasManifestPagination, {
    type: 'default.CanvasManifestPagination',
    label: 'Canvas manifest navigation',
    anyContext: ['canvas'],
    requiredContext: ['canvas'],
    defaultProps: {
        size: 'full',
    },
    editor: {
        size: {
            label: 'component size',
            type: 'dropdown-field',
            options: [
                {value: 'full', text: 'Full size'},
                {value: 'small', text: 'Small'},
            ],
        },
    },
});
