import { registerRefinement } from '@capture-models/plugin-api';
import React from 'react';
import { SingleFieldInstance } from '../SingleFieldInstance';
import { NewFieldButtonInstance } from '../NewFieldInstanceButton';

registerRefinement({
  name: 'Single field instance',
  type: 'field-instance-list',
  supports(subject, { readOnly }) {
    return subject.instance.length === 1 && !readOnly;
  },
  refine(subject, actions) {
    const selectedField = subject.instance[0];

    return (
      <>
        <SingleFieldInstance
          path={[...actions.path, [subject.property, selectedField.id]]}
          field={subject.instance[0]}
        />
        {selectedField.allowMultiple ? (
          <NewFieldButtonInstance property={subject.property} path={actions.path} field={selectedField} />
        ) : null}
      </>
    );
  },
});
