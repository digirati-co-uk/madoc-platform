import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CanvasNavigation } from '../../shared/components/CanvasNavigation';
import { useCanvasSearchText } from '../../shared/hooks/use-canvas-search';
import { useRouteContext } from '../hooks/use-route-context';

export const CanvasThumbnailNavigation: React.FC<{ hidden?: boolean; subRoute?: string }> = ({ hidden, subRoute }) => {
  const { manifestId, collectionId, canvasId, projectId } = useRouteContext<{ canvasId: number }>();
  const searchText = useCanvasSearchText(canvasId);

  if (!projectId || !manifestId || !canvasId || hidden) {
    return null;
  }

  return (
    <CanvasNavigation
      subRoute={subRoute}
      manifestId={manifestId}
      canvasId={canvasId}
      collectionId={collectionId}
      projectId={projectId}
      query={searchText ? { searchText } : undefined}
    />
  );
};

blockEditorFor(CanvasThumbnailNavigation, {
    type: 'default.CanvasThumbnailNavigation',
    label: 'Canvas thumbnail navigation',
    anyContext: ['canvas'],
    requiredContext: ['manifest', 'canvas'],
    defaultProps: {
        hidden: false,
        subRoute: '',
    },
    editor: {
        hidden: {type: 'checkbox-field', inlineLabel: 'Hide on page', label: 'Hide'},
        subRoute: {
            type: 'text-field',
            label: 'Navigation sub route',
            description: `If you use this on a sub page (e.g. manifest/1/c/2/SUB_ROUTE) this will ensure paginated links are accurate.`,
        },
    },
});
