import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { SimpleAtlasViewer } from '../../shared/components/SimpleAtlasViewer';
import { useCanvasSearch } from '../../shared/hooks/use-canvas-search';
import { useRouteContext } from '../hooks/use-route-context';
import { useViewerHeight } from '../hooks/use-viewer-height';

export const CanvasImageViewer: React.FC<{ rendering?: 'webgl' | 'canvas' }> = ({ rendering = 'canvas' }) => {
  const { canvasId } = useRouteContext();
  const [, highlightedRegions] = useCanvasSearch(canvasId);
  const height = useViewerHeight();

  console.log('CanvasImageViewer', { canvasId });

  if (!canvasId) {
    return null;
  }

  return (
    <SimpleAtlasViewer
      unstable_webglRenderer={rendering === 'webgl'}
      style={{ height, width: '100%' }}
      highlightedRegions={highlightedRegions ? highlightedRegions.bounding_boxes : undefined}
    />
  );
};

blockEditorFor(CanvasImageViewer, {
  type: 'CanvasImageViewer',
  label: 'Atlas canvas viewer (no toolbar)',
  requiredContext: ['manifest', 'canvas'],
  anyContext: ['canvas'],
  editor: {
    rendering: {
      label: 'Rendering',
      description: 'Which rendering engine should be used for this viewer',
      type: 'dropdown-field',
      options: [
        { value: 'webgl', text: 'WebGL' },
        { value: 'canvas', text: 'Canvas' },
      ],
    },
  },
  defaultProps: {
    rendering: 'webgl',
  },
});
