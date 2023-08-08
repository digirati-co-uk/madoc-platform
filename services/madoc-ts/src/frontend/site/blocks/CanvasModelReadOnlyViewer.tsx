import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CanvasVaultContext } from '../../shared/capture-models/CanvasVaultContext';
import { CanvasHighlightedRegions } from '../features/canvas/CanvasHighlightedRegions';
import { CanvasImageViewer } from './CanvasImageViewer';
import { CanvasViewer } from '../features/canvas/CanvasViewer';

export const CanvasModelReadOnlyViewer: React.FC = () => {
  return (
    <CanvasVaultContext>
      <CanvasHighlightedRegions />

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
