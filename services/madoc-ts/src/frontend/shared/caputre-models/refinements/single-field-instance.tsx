import { registerRefinement } from '@capture-models/plugin-api';
import React from 'react';
import { SingleFieldInstance } from '../SingleFieldInstance';
import { NewFieldButtonInstance } from '../NewFieldInstanceButton';
import { FieldInstanceReadOnly } from '@capture-models/editor';

registerRefinement({
  name: 'Single field instance',
  type: 'field-instance-list',
  supports(subject, { readOnly }) {
    return subject.instance.length === 1;
  },
  refine(subject, actions) {
    const selectedField = subject.instance[0];

    if (actions.readOnly) {
      return <FieldInstanceReadOnly fields={subject.instance} />;
    }

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
