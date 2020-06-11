import { registerRefinement } from '@capture-models/plugin-api';
import { CaptureModel } from '@capture-models/types';
import React from 'react';
import { VerboseEntityPage } from '../VerboseEntityPage';

registerRefinement({
  type: 'entity',
  name: 'Basic un-nesting',
  supports(entity) {
    const keys = Object.keys(entity.instance.properties);
    return (
      keys.length === 1 &&
      entity.instance.properties[keys[0]].length === 1 &&
      entity.instance.properties[keys[0]][0].type === 'entity'
    );
  },
  refine(entity, actions, children) {
    const keys = Object.keys(entity.instance.properties);
    const onlyEntity = entity.instance.properties[keys[0]][0] as CaptureModel['document'];

    return (
      <VerboseEntityPage
        staticBreadcrumbs={[...(actions.staticBreadcrumbs || []), entity.instance.label]}
        entity={{ instance: onlyEntity, property: keys[0] }}
        path={[...actions.path, [keys[0], onlyEntity.id]]}
        goBack={actions.goBack}
        readOnly={actions.readOnly}
        hideSplash={actions.hideSplash}
        hideCard={actions.hideCard}
      >
        {children}
      </VerboseEntityPage>
    );
  },
});
