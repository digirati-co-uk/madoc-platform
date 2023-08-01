import { useEffect } from 'react';
import { Revisions } from '../../editor/stores/revisions/index';
import { RevisionRequest } from '../../types/revision-request';

export function RevisionOnChange({ onChange }: { onChange: (data: RevisionRequest | null) => void }) {
  const store = Revisions.useStore();

  useEffect(() => {
    let lastRevision = store.getState().currentRevision;
    return store.subscribe(() => {
      const data = store.getState();
      if (data.currentRevision !== lastRevision) {
        lastRevision = data.currentRevision;
        onChange(data.currentRevision);
      }
    });
  }, [store]);

  return null;
}
