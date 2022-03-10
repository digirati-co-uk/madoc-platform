import React from 'react';
import { registerRefinement } from '../plugin-api/global-store';
import { RevisionTopLevel } from '../RevisionTopLevel';
import { StructureType } from '../types/utility';

registerRefinement({
  type: 'choice-navigation',
  name: 'Single choice top level',
  supports: (subject, context) => {
    return !!(subject.instance.type === 'choice' && context.currentRevisionId);
  },
  refine(subject, context) {
    const currentView = (subject.instance as StructureType<'choice'>).items[0];
    return (
      <RevisionTopLevel
        onSaveRevision={context.onSaveRevision}
        instructions={
          currentView.type === 'model' && currentView.instructions ? currentView.instructions : currentView.description
        }
        readOnly={context.readOnly || false}
        allowEdits={(context as any).allowEdits}
      />
    );
  },
});
