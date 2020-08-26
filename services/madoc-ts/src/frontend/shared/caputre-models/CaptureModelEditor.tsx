import React from 'react';
import { CaptureModel, RevisionRequest } from '@capture-models/types';
import { RevisionNavigation } from './RevisionNavigation';
import { useViewerSaving } from '../hooks/use-viewer-saving';

export const CaptureModelEditor: React.FC<{
  captureModel: CaptureModel;
  onSave: (req: RevisionRequest, status?: string) => void;
  readOnly?: boolean;
  allowEdits?: boolean;
}> = ({ captureModel, readOnly, allowEdits, onSave }) => {
  const updateFunction = useViewerSaving(onSave);

  return (
    <RevisionNavigation
      structure={captureModel.structure}
      readOnly={readOnly}
      allowEdits={allowEdits}
      onSaveRevision={updateFunction}
    />
  );
};
