import React, { useCallback } from 'react';
import { useLocalStorage } from '../../../frontend/shared/hooks/use-local-storage';
import { useLocationQuery } from '../../../frontend/shared/hooks/use-location-query';
import { CanvasSimpleEditor } from '../../../frontend/site/features/canvas/CanvasSimpleEditor';
import { useProject } from '../../../frontend/site/hooks/use-project';
import { useProjectStatus } from '../../../frontend/site/hooks/use-project-status';
import type { CaptureModel } from '../../../frontend/shared/capture-models/types/capture-model';
import { applyTranscriptionMetadata } from '../transcription-metadata';

export function TranscriptionProjectEditor() {
  const { data: project } = useProject();
  const { revision } = useLocationQuery();
  const { isPreparing } = useProjectStatus();
  const [isSegmentation] = useLocalStorage('segmentation-prepare', false);
  const transform = useCallback(
    (model: CaptureModel) => applyTranscriptionMetadata(model, project?.template_config),
    [project?.template_config]
  );
  return (
    <CanvasSimpleEditor
      revision={revision}
      isSegmentation={isSegmentation && isPreparing}
      transformCaptureModel={transform}
    />
  );
}
