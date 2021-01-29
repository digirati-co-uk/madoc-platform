import { Revisions, useNavigation } from '@capture-models/editor';
import { isEntity } from '@capture-models/helpers';
import React, { useEffect } from 'react';

export const CorrectingRevisionSubtree: React.FC = () => {
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const revisionSubtreeField = Revisions.useStoreState(s => s.revisionSubtreeField);
  const revisionSubtree = Revisions.useStoreState(s => s.revisionSubtree);
  const revisionPopSubtree = Revisions.useStoreActions(a => a.revisionPopSubtree);
  const [currentView] = useNavigation();

  useEffect(() => {
    if (
      currentRevisionId &&
      currentView &&
      currentView.type === 'model' &&
      !revisionSubtreeField &&
      !isEntity(revisionSubtree)
    ) {
      // select
      // actions.
      revisionPopSubtree({ count: 1 });
    }
  }, [revisionPopSubtree, currentRevisionId, currentView, revisionSubtree, revisionSubtreeField]);

  return null;
};
