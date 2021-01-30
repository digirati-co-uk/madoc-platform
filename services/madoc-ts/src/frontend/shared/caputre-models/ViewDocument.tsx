import { Revisions } from '@capture-models/editor';
import { serialiseCaptureModel } from '@capture-models/helpers';
import React, { useEffect } from 'react';
import { RevisionTopLevel } from './RevisionTopLevel';
import { useApi } from '../hooks/use-api';

export const ViewDocument: React.FC<{ onSave: (revision: any) => void }> = ({ onSave }) => {
  const api = useApi();

  const isPreviewing = Revisions.useStoreState(s => s.isPreviewing);
  const revision = Revisions.useStoreState(s => s.currentRevision);
  const setIsPreviewing = Revisions.useStoreActions(a => a.setIsPreviewing);

  useEffect(() => {
    if (isPreviewing) {
      onSave(revision ? serialiseCaptureModel(revision.document) : null);
      setIsPreviewing(false);
    }
  }, [revision, isPreviewing, onSave, setIsPreviewing]);
  if (isPreviewing) {
    return null;
  }

  return (
    <>
      {api.getIsServer() ? null : (
        <RevisionTopLevel
          onSaveRevision={async req => {
            // no-op
          }}
          skipThankYou={true}
          instructions={''}
          allowEdits={true}
          allowNavigation={false}
          readOnly={false}
        />
      )}
    </>
  );
};
