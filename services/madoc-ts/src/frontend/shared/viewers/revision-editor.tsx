import { RevisionRequest } from '@capture-models/types';
import { RevisionTopLevel } from '../caputre-models/RevisionTopLevel';
import React from 'react';
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
