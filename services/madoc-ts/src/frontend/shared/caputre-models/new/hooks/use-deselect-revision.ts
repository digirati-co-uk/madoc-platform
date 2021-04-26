import { Revisions, useNavigation } from '@capture-models/editor';
import { useCallback } from 'react';

export function useDeselectRevision() {
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const deselectRevision = Revisions.useStoreActions(a => a.deselectRevision);
  const [, { pop }] = useNavigation();

  return useCallback(() => {
    if (currentRevision) {
      // Deselect revision.
      deselectRevision({ revisionId: currentRevision.revision.id });
      pop();
    }
  }, [currentRevision, deselectRevision, pop]);
}
