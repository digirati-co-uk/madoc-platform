import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { CanvasImageViewer } from './CanvasImageViewer';
import { CanvasViewer } from './CanvasViewer';
import { IdaCanvasViewer } from './IdaCanvasViewer';

export const CanvasAtlasViewer: React.FC<{ rendering?: 'webgl' | 'canvas'; styled?: 'styled' | 'normal' }> = ({
  rendering = 'canvas',
  styled,
}) => {
  if (styled === 'styled') {
    return (
      <IdaCanvasViewer>
        <CanvasImageViewer rendering={rendering} />
      </IdaCanvasViewer>
    );
  } else {
    return (
      <CanvasViewer>
        <CanvasImageViewer rendering={rendering} />
      </CanvasViewer>
    );
  }
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
    styled: {
      label: 'styled version',
      type: 'dropdown-field',
      options: [
        { value: 'normal', text: 'normal' },
        { value: 'styled', text: 'styled' },
      ],
    },
  },
  defaultProps: {
    rendering: 'webgl',
    styled: 'normal',
  },
  anyContext: ['canvas'],
  requiredContext: ['manifest', 'canvas'],
});
