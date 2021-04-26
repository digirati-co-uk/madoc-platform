import { Revisions, useNavigation } from '@capture-models/editor';
import React, { useEffect, useMemo } from 'react';
import { useRevisionList } from '../hooks/use-revision-list';

export const AutoSelectingRevision: React.FC = () => {
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const structure = Revisions.useStoreState(s => s.structure);
  const createRevision = Revisions.useStoreActions(a => a.createRevision);
  const selectRevision = Revisions.useStoreActions(a => a.selectRevision);
  const [currentView, { push }] = useNavigation();
  const revisionList = useRevisionList({ filterCurrentView: false });

  const lastWorkedOn = revisionList.myUnpublished.length ? revisionList.myUnpublished[0] : undefined;

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
      if (lastWorkedOn) {
        selectRevision({ revisionId: lastWorkedOn.revision.id });
      } else {
        createRevision({ revisionId: skipToStructureRevision, cloneMode: 'EDIT_ALL_VALUES' });
      }
    }
  }, [createRevision, lastWorkedOn, selectRevision, skipToStructureRevision]);

  useEffect(() => {
    if (currentView && currentView.type === 'model' && !skipToStructureRevision && !currentRevisionId) {
      if (lastWorkedOn) {
        selectRevision({ revisionId: lastWorkedOn.revision.id });
      } else {
        createRevision({ revisionId: currentView.id, cloneMode: 'EDIT_ALL_VALUES' });
      }
    }
    if (
      currentView &&
      currentView.type === 'choice' &&
      currentView.items.length === 1 &&
      currentView.items[0].type === 'model'
    ) {
      push(currentView.items[0].id);
    }
  }, [createRevision, currentRevisionId, currentView, lastWorkedOn, push, selectRevision, skipToStructureRevision]);

  return null;
};
