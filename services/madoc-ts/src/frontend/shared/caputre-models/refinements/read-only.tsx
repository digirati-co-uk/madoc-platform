import { FieldPreview } from '@capture-models/editor';
import { registerRefinement } from '@capture-models/plugin-api';
import React from 'react';

registerRefinement({
  name: 'Read only fields',
  type: 'field-instance-list',
  supports(subject, { readOnly }) {
    return readOnly === true;
  },
  refine(subject, actions) {
    return (
      <>
        <h5 style={{ fontWeight: 300, fontSize: '.85em', marginBottom: '5px' }}>{subject.instance[0].label}</h5>
        <div style={{ fontWeight: 600, fontSize: '1.2em' }}>
          {subject.instance.map(field => (
            <FieldPreview as="p" key={field.id} field={field} />
          ))}
        </div>
      </>
    );
  },
});
