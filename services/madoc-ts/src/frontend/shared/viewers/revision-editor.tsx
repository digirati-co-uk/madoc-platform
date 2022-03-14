import { RevisionTopLevel } from '../capture-models/RevisionTopLevel';
import React from 'react';
import { RevisionRequest } from '../capture-models/types/revision-request';
import { useViewerSaving } from '../hooks/use-viewer-saving';

export const RevisionEditor: React.FC<{
  onSave: (req: RevisionRequest, status?: string) => void;
  readOnly?: boolean;
  allowEdits?: boolean;
}> = ({ readOnly, allowEdits, onSave }) => {
  const updateFunction = useViewerSaving(onSave);

  return (
    <RevisionTopLevel
      allowNavigation={false}
      allowEdits={allowEdits}
      onSaveRevision={updateFunction}
      readOnly={!!readOnly}
    />
  );
};
