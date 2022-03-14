import React, { useEffect } from 'react';
import { Revisions } from '../../editor/stores/revisions/index';
import { isEntity } from '../../helpers/is-entity';

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
