import React from 'react';
import { registerRefinement } from '../plugin-api/global-store';
import { SingleFieldInstance } from '../SingleFieldInstance';

registerRefinement({
  name: 'Single field instance',
  type: 'field-instance-list',
  supports(subject, { readOnly }) {
    // Only after lists of multiple values.
    if (subject.instance.length <= 1) {
      return false;
    }
    // Don't support read only.
    if (readOnly) {
      return false;
    }
    const singleField = subject.instance[0];
    // Only fields, not entities.
    if (singleField.type === 'entity') {
      return false;
    }
    // Selectors not supported.
    return !singleField.selector;
  },
  refine(subject, actions) {
    return (
      <>
        {subject.instance.map((field, idx) => (
          <SingleFieldInstance
            key={idx}
            hideHeader={idx !== 0}
            path={[...actions.path, [subject.property, field.id]]}
            field={field}
          />
        ))}
      </>
    );
  },
});
