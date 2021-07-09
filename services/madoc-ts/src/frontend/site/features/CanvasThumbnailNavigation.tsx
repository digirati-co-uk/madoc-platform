import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { CanvasNavigation } from '../../shared/components/CanvasNavigation';
import { useCanvasSearchText } from '../../shared/hooks/use-canvas-search';
import { useRouteContext } from '../hooks/use-route-context';

export const CanvasThumbnailNavigation: React.FC<{ hidden?: boolean }> = ({ hidden }) => {
  const { manifestId, collectionId, canvasId, projectId } = useRouteContext<{ canvasId: number }>();
  const searchText = useCanvasSearchText(canvasId);

  if (!projectId || !manifestId || !canvasId || hidden) {
    return null;
  }

  return (
    <CanvasNavigation
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
  },
  editor: {
    hidden: { type: 'checkbox-field', inlineLabel: 'Hide on page', label: 'Hide' },
  },
});
