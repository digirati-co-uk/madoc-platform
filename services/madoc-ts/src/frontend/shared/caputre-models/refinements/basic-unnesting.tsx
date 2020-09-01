import { registerRefinement } from '@capture-models/plugin-api';
import { CaptureModel } from '@capture-models/types';
import React, { useEffect } from 'react';
import { Revisions } from '@capture-models/editor';

const BasicUnNesting: React.FC<{ id: string; term: string }> = props => {
  const push = Revisions.useStoreActions(a => a.revisionPushSubtree);

  useEffect(() => {
    push({ term: props.term, id: props.id, skip: true });
  }, [props.id, props.term, push]);

  return null;
};

registerRefinement({
  type: 'entity',
  name: 'Basic un-nesting',
  supports(entity) {
    const keys = Object.keys(entity.instance.properties);
    return (
      keys.length === 1 &&
      entity.instance.properties[keys[0]].length === 1 &&
      entity.instance.properties[keys[0]][0].type === 'entity' &&
      (entity.instance.immutable || !entity.instance.properties[keys[0]][0].selector)
    );
  },
  refine(entity) {
    const keys = Object.keys(entity.instance.properties);
    const onlyEntity = entity.instance.properties[keys[0]][0] as CaptureModel['document'];

    return <BasicUnNesting term={keys[0]} id={onlyEntity.id} />;
  },
});
