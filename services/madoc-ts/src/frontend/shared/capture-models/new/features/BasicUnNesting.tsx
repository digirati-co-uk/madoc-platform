import React, { useEffect } from 'react';
import { Revisions } from '../../editor/stores/revisions/index';
import { isEntity } from '../../helpers/is-entity';
import { CaptureModel } from '../../types/capture-model';

export const BasicUnNesting: React.FC = () => {
  const push = Revisions.useStoreActions(a => a.revisionPushSubtree);
  const revisionSubtree = Revisions.useStoreState(s => s.revisionSubtree);

  useEffect(() => {
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
  }, [revisionSubtree, push]);

  return null;
};
