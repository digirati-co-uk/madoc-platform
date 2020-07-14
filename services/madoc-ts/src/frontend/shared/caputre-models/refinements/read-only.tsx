import { FieldPreview, FieldInstanceReadOnly } from '@capture-models/editor';
import { registerRefinement } from '@capture-models/plugin-api';
import React from 'react';

registerRefinement({
  name: 'Read only fields',
  type: 'field-instance-list',
  supports(subject, { readOnly }) {
    return readOnly === true;
  },
  refine(subject, actions) {
    return <FieldInstanceReadOnly fields={subject.instance} />;
  },
});
