import React from 'react';
import { RevisionNavigation } from './RevisionNavigation';
import { useViewerSaving } from '../hooks/use-viewer-saving';
import { CaptureModel } from './types/capture-model';
import { RevisionRequest } from './types/revision-request';

export const CaptureModelEditor: React.FC<{
  captureModel: CaptureModel;
  onSave: (req: RevisionRequest, status?: string) => void;
  readOnly?: boolean;
  allUsers?: boolean;
  allowEdits?: boolean;
}> = ({ captureModel, readOnly, allowEdits, allUsers, onSave }) => {
  const updateFunction = useViewerSaving(onSave);

  return (
    <RevisionNavigation
      structure={captureModel.structure}
      readOnly={readOnly}
      allUsers={allUsers}
      allowEdits={allowEdits}
      onSaveRevision={updateFunction}
    />
  );
};
