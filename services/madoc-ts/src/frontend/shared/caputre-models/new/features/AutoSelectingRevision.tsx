import { Revisions, useNavigation } from '@capture-models/editor';
import React, { useEffect, useMemo } from 'react';

export const AutoSelectingRevision: React.FC = () => {
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const structure = Revisions.useStoreState(s => s.structure);
  const createRevision = Revisions.useStoreActions(a => a.createRevision);
  const [currentView, { push }] = useNavigation();

  const skipToStructureRevision = useMemo(() => {
    if (
      !currentRevisionId &&
      structure &&
      structure.type === 'choice' &&
      structure.items.length === 1 &&
      structure.items[0].type === 'model'
    ) {
      return structure.items[0].id;
    }
  }, [currentRevisionId, structure]);

  useEffect(() => {
    if (skipToStructureRevision) {
      createRevision({ revisionId: skipToStructureRevision, cloneMode: 'FORK_INSTANCE' });
    }
  }, [createRevision, skipToStructureRevision]);

  useEffect(() => {
    if (currentView && currentView.type === 'model') {
      createRevision({ revisionId: currentView.id, cloneMode: 'FORK_INSTANCE' });
    }
    if (
      currentView &&
      currentView.type === 'choice' &&
      currentView.items.length === 1 &&
      currentView.items[0].type === 'model'
    ) {
      push(currentView.items[0].id);
    }
  }, [createRevision, currentView, push]);

  return null;
};
