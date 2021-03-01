import { Revisions } from '@capture-models/editor';
import React, { useEffect } from 'react';

export const SwitchEditMode: React.FC = () => {
  const revisionEditMode = Revisions.useStoreState(s => s.revisionEditMode);
  const setRevisionMode = Revisions.useStoreActions(a => a.setRevisionMode);

  useEffect(() => {
    if (!revisionEditMode) {
      setRevisionMode({ editMode: true });
    }
  }, [revisionEditMode, setRevisionMode]);

  return null;
};
