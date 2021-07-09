import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { CanvasAtlasViewer } from './CanvasAtlasViewer';
import { CanvasMiradorViewer } from './CanvasMiradorViewer';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const CanvasConfigurationViewer: React.FC = () => {
  const {
    project: { miradorCanvasPage = false },
  } = useSiteConfiguration();

  return <>{miradorCanvasPage ? <CanvasMiradorViewer /> : <CanvasAtlasViewer />}</>;
};

blockEditorFor(CanvasConfigurationViewer, {
  type: 'default.CanvasConfigurationViewer',
  label: 'Canvas viewer based on config',
  anyContext: ['canvas'],
  requiredContext: ['canvas'],
  editor: {},
});
