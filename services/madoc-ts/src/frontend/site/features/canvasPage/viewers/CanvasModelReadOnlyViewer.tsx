import React from 'react';
import { blockEditorFor } from '../../../../../extensions/page-blocks/block-editor-for';
import { CanvasVaultContext } from '../../../../shared/components/CanvasVaultContext';
import { CanvasHighlightedRegions } from '../CanvasHighlightedRegions';
import { CanvasImageViewer } from '../CanvasImageViewer';
import { CanvasViewer } from './CanvasViewer';

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
