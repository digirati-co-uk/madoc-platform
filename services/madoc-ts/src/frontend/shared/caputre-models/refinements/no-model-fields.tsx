import { registerRefinement } from '@capture-models/plugin-api';
import React from 'react';

registerRefinement({
  type: 'revision-list',
  name: 'No model fields',
  supports: (subject, context) => {
    return subject.instance.type === 'model' && subject.instance.fields.length === 0;
  },
  refine() {
    return (
      <div>
        <h3>Invalid model</h3>
        <p>This capture model has no fields configured.</p>
      </div>
    );
  },
});
