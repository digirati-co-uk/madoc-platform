import React from 'react';
import { FieldInstanceReadOnly } from '../editor/components/FieldInstanceReadOnly/FieldInstanceReadOnly';
import { registerRefinement } from '../plugin-api/global-store';
import { SingleFieldInstance } from '../SingleFieldInstance';
import { NewFieldButtonInstance } from '../NewFieldInstanceButton';

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
        {selectedField.allowMultiple && !(actions as any).immutableEntity ? (
          <NewFieldButtonInstance property={subject.property} path={actions.path} field={selectedField} />
        ) : null}
      </>
    );
  },
});
