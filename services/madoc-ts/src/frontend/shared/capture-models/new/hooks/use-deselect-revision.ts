import { useCallback } from 'react';
import { useNavigation } from '../../editor/hooks/useNavigation';
import { Revisions } from '../../editor/stores/revisions/index';

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
