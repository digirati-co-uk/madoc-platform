import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useLocalStorage } from '../../shared/hooks/use-local-storage';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { useProjectTemplate } from '../../shared/hooks/use-project-template';
import { useUser } from '../../shared/hooks/use-site';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useProject } from '../hooks/use-project';
import { useProjectStatus } from '../hooks/use-project-status';
import { CanvasSimpleEditor } from '../features/canvas/CanvasSimpleEditor';
import { TrainingVideoContributionPrompt } from '../features/training-video/TrainingVideoContributionPrompt';

export const CanvasModelEditor: React.FC = () => {
  const { showCanvasNavigation } = useCanvasNavigation();
  const { revision } = useLocationQuery();
  const user = useUser();
  const { data: project } = useProject();
  const template = useProjectTemplate(project?.template);
  const CustomEditor = template?.components?.customEditor;
  const { isPreparing } = useProjectStatus();
  const [isSegmentation] = useLocalStorage('segmentation-prepare', false);

  if (!showCanvasNavigation || !user) {
    return null;
  }

  return (
    <>
      {CustomEditor ? (
        <CustomEditor />
      ) : (
        <CanvasSimpleEditor revision={revision} isSegmentation={isSegmentation && isPreparing} />
      )}
      <TrainingVideoContributionPrompt />
    </>
  );
};

blockEditorFor(CanvasModelEditor, {
  type: 'default.CanvasModelEditor',
  label: 'Canvas model editor',
  requiredContext: ['project', 'manifest', 'canvas'],
  anyContext: ['canvas'],
  editor: {},
});
