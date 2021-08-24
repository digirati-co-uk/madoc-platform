import { Revisions } from '@capture-models/editor';
import { isEntity } from '@capture-models/helpers';
import React, { useEffect } from 'react';

export const AutoSelectDefineRegion: React.FC = () => {
  const revisionSubtreeField = Revisions.useStoreState(s => s.revisionSubtreeField);
  const revisionSubtree = Revisions.useStoreState(s => s.revisionSubtree);
  const chooseSelector = Revisions.useStoreActions(a => a.chooseSelector);
  const currentSelectorId = Revisions.useStoreState(s => s.selector.currentSelectorId);

  useEffect(() => {
    if (!currentSelectorId && revisionSubtree && !revisionSubtreeField && isEntity(revisionSubtree)) {
      if (revisionSubtree.selector && !revisionSubtree.selector.state) {
        chooseSelector({ selectorId: revisionSubtree.selector.id });
      }
    }
  }, [chooseSelector, currentSelectorId, revisionSubtree, revisionSubtreeField]);

  return null;
};
