import React from 'react';
import { registerRefinement } from '@capture-models/plugin-api';
import { EntityInstanceList } from '../EntityInstanceList';

registerRefinement({
  type: 'entity-instance-list',
  name: 'Filter entity revises',
  supports({ instance }) {
    const ids = instance.map(i => i.id);

    for (const singleField of instance) {
      if (singleField.revises && ids.indexOf(singleField.revises) !== -1) {
        return true;
      }
    }

    return false;
  },
  refine({ instance, property }, { path, chooseEntity, readOnly }, children) {
    const duplicates = instance.filter(i => i.revises).map(i => i.revises);

    return (
      <EntityInstanceList
        entities={instance.filter(i => duplicates.indexOf(i.id) === -1)}
        property={property}
        chooseEntity={chooseEntity}
        path={path}
      >
        {children}
      </EntityInstanceList>
    );
  },
});
