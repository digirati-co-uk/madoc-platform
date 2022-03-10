import React, { useEffect } from 'react';
import { Revisions } from '../../editor/stores/revisions/index';

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
