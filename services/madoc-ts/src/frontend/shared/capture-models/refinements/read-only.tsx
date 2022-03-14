import React from 'react';
import { FieldInstanceReadOnly } from '../editor/components/FieldInstanceReadOnly/FieldInstanceReadOnly';
import { registerRefinement } from '../plugin-api/global-store';

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
