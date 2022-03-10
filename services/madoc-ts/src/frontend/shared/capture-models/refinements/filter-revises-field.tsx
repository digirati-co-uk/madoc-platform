import React from 'react';
import { FieldInstanceList } from '../editor/components/FieldInstanceList/FieldInstanceList';
import { registerRefinement } from '../plugin-api/global-store';

registerRefinement({
  type: 'field-instance-list',
  name: 'Filter revises',
  supports({ instance }) {
    const ids = instance.map(i => i.id);

    for (const singleField of instance) {
      if (singleField.revises && ids.indexOf(singleField.revises) !== -1) {
        return true;
      }
    }

    return false;
  },
  refine({ instance, property }, { path, chooseField, readOnly }, children) {
    const duplicates = instance.filter(i => i.revises).map(i => i.revises);

    return (
      <FieldInstanceList
        fields={instance.filter(i => duplicates.indexOf(i.id) === -1)}
        property={property}
        chooseField={chooseField}
      >
        {children}
      </FieldInstanceList>
    );
  },
});
