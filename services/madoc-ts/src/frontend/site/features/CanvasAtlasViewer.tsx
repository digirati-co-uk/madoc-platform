import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { CanvasImageViewer } from './CanvasImageViewer';
import { CanvasViewer } from './CanvasViewer';

export const CanvasAtlasViewer: React.FC<{ rendering?: 'webgl' | 'canvas' }> = ({ rendering = 'webgl' }) => {
  return (
    <CanvasViewer>
      <CanvasImageViewer rendering={rendering} />
    </CanvasViewer>
  );
};

blockEditorFor(CanvasAtlasViewer, {
  type: 'CanvasAtlasViewer',
  label: 'Atlas canvas viewer + toolbar',
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
  anyContext: ['canvas'],
  requiredContext: ['manifest', 'canvas'],
});
