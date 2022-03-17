import React, { useEffect } from 'react';
import { Revisions } from '../../editor/stores/revisions/index';
import { isEntity } from '../../helpers/is-entity';
import { resolveSelector } from '../../helpers/resolve-selector';

export const AutoSelectDefineRegion: React.FC = () => {
  const revisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const revisionSubtreeField = Revisions.useStoreState(s => s.revisionSubtreeField);
  const revisionSubtree = Revisions.useStoreState(s => s.revisionSubtree);
  const chooseSelector = Revisions.useStoreActions(a => a.chooseSelector);
  const currentSelectorId = Revisions.useStoreState(s => s.selector.currentSelectorId);

  useEffect(() => {
    if (!currentSelectorId && revisionSubtree && !revisionSubtreeField && isEntity(revisionSubtree)) {
      if (revisionSubtree.selector) {
        const revised = resolveSelector(revisionSubtree.selector, revisionId);
        if (revised && !revised.state) {
          chooseSelector({ selectorId: revisionSubtree.selector.id });
        }
      }
    }
  }, [revisionId, chooseSelector, currentSelectorId, revisionSubtree, revisionSubtreeField]);

  return null;
};
