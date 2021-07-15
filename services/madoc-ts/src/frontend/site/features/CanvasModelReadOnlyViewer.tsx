import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { CanvasVaultContext } from '../../shared/components/CanvasVaultContext';
import { CanvasImageViewer } from './CanvasImageViewer';
import { CanvasViewer } from './CanvasViewer';

export const CanvasModelReadOnlyViewer: React.FC = () => {
  return (
    <CanvasVaultContext>
      <CanvasViewer>
        <CanvasImageViewer />
      </CanvasViewer>
    </CanvasVaultContext>
  );
};

blockEditorFor(CanvasModelReadOnlyViewer, {
  type: 'default.CanvasModelReadOnlyViewer',
  label: 'Canvas model read-only viewer',
  anyContext: ['canvas'],
  requiredContext: ['project', 'manifest', 'canvas'],
  editor: {},
});
