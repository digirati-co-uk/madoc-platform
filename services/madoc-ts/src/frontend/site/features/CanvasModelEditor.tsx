import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useLocalStorage } from '../../shared/hooks/use-local-storage';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { useUser } from '../../shared/hooks/use-site';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useProjectStatus } from '../hooks/use-project-status';
import { CanvasSimpleEditor } from './CanvasSimpleEditor';

export const CanvasModelEditor: React.FC = () => {
  const { showCanvasNavigation } = useCanvasNavigation();
  const { revision } = useLocationQuery();
  const user = useUser();
  const { isPreparing } = useProjectStatus();
  const [isSegmentation] = useLocalStorage('segmentation-prepare', false);

  if (!showCanvasNavigation || !user) {
    return null;
  }

  return <CanvasSimpleEditor revision={revision} isSegmentation={isSegmentation && isPreparing} />;
};

blockEditorFor(CanvasModelEditor, {
  type: 'default.CanvasModelEditor',
  label: 'Canvas model editor',
  requiredContext: ['project', 'manifest', 'canvas'],
  anyContext: ['canvas'],
  editor: {},
});
