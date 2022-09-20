import React, { useLayoutEffect } from 'react';
import { Revisions } from '../../editor/stores/revisions/index';
import { isEntity } from '../../helpers/is-entity';
import { resolveSelector } from '../../helpers/resolve-selector';

export const AutoSelectDefineRegion: React.FC = () => {
  const revisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const revisionSubtreeField = Revisions.useStoreState(s => s.revisionSubtreeField);
  const revisionSubtree = Revisions.useStoreState(s => s.revisionSubtree);
  const chooseSelector = Revisions.useStoreActions(a => a.chooseSelector);
  const currentSelectorId = Revisions.useStoreState(s => s.selector.currentSelectorId);

  useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      if (!currentSelectorId && revisionSubtree && !revisionSubtreeField && isEntity(revisionSubtree)) {
        if (revisionSubtree.selector) {
          const revised = resolveSelector(revisionSubtree.selector, revisionId);
          if (revised && !revised.state) {
            chooseSelector({ selectorId: revisionSubtree.selector.id });
          }
        }
      }
    }, 500);
    return () => {
      clearTimeout(timeout);
    };
  }, [revisionId, chooseSelector, currentSelectorId, revisionSubtree, revisionSubtreeField]);

  return null;
};
