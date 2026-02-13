import React, { useEffect } from 'react';
import { Revisions } from '../../editor/stores/revisions/index';
import { isEntity } from '../../helpers/is-entity';
import { CaptureModel } from '../../types/capture-model';
import { isTwoLevelInlineEntityModel } from '../utility/get-max-entity-depth';

export const BasicUnNesting: React.FC = () => {
  const push = Revisions.useStoreActions(a => a.revisionPushSubtree);
  const { revisionSubtree, currentRevision } = Revisions.useStoreState(s => ({
    revisionSubtree: s.revisionSubtree,
    currentRevision: s.currentRevision,
  }));

  useEffect(() => {
    if (isTwoLevelInlineEntityModel(currentRevision?.document)) {
      return;
    }

    if (revisionSubtree && revisionSubtree.type === 'entity') {
      const entity = revisionSubtree;
      if (isEntity(entity)) {
        const keys = Object.keys(entity.properties);
        const supports =
          keys.length === 1 &&
          entity.properties[keys[0]].length === 1 &&
          entity.properties[keys[0]][0].type === 'entity';
        if (supports) {
          const term = keys[0];
          const onlyEntity = entity.properties[keys[0]][0] as CaptureModel['document'];
          if (keys.length && onlyEntity && !onlyEntity.allowMultiple) {
            push({ term: term, id: onlyEntity.id, skip: true });
          }
        }
      }
    }
  }, [currentRevision?.document, revisionSubtree, push]);

  return null;
};
