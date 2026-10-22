import React from 'react';
import { TrainingVideoContributionPrompt } from '../features/training-video/TrainingVideoContributionPrompt';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useLocalStorage } from '../../shared/hooks/use-local-storage';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { useUser } from '../../shared/hooks/use-site';
import { useProjectStatus } from '../hooks/use-project-status';
import { ManifestCaptureModelEditor } from '../features/manifest/ManifestCaptureModelEditor';

export const ManifestModelEditor = () => {
  const { revision } = useLocationQuery();
  const user = useUser();
  const { isPreparing } = useProjectStatus();
  const [isSegmentation] = useLocalStorage('segmentation-prepare', false);

  if (!user) {
    return null;
  }

  return (
    <>
      <ManifestCaptureModelEditor revision={revision} isSegmentation={isSegmentation && isPreparing} />
      <TrainingVideoContributionPrompt />
    </>
  );
};

blockEditorFor(ManifestModelEditor, {
  type: 'default.ManifestModelEditor',
  label: 'Manifest model editor',
  requiredContext: ['project', 'manifest'],
  anyContext: ['manifest'],
  editor: {},
});
