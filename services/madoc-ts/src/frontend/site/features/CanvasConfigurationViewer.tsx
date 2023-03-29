import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CanvasAtlasViewer } from './CanvasAtlasViewer';
import { CanvasMiradorViewer } from './CanvasMiradorViewer';
import { CanvasUniversalViewer } from './CanvasUniversalViewer';
import { useSiteConfiguration } from './SiteConfigurationContext';
import { useRouteContext } from '../hooks/use-route-context';

export const CanvasConfigurationViewer: React.FC = () => {
  const {
    project: { miradorCanvasPage = false, universalViewerCanvasPage = false },
  } = useSiteConfiguration();
  const { topic } = useRouteContext();

  return (
    <>
      {universalViewerCanvasPage ? (
        <CanvasUniversalViewer />
      ) : miradorCanvasPage ? (
        <CanvasMiradorViewer />
      ) : (
        <CanvasAtlasViewer topic={!!topic} />
      )}
    </>
  );
};

blockEditorFor(CanvasConfigurationViewer, {
  type: 'default.CanvasConfigurationViewer',
  label: 'Canvas viewer based on config',
  anyContext: ['canvas'],
  requiredContext: ['canvas'],
  editor: {},
});
