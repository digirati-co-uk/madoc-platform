import React from 'react';
import { registerRefinement } from '../plugin-api/global-store';
import { TabNavigation } from '../TabNavigation';
import { RevisionChoicePage } from '../RevisionChoicePage';
import { RevisionTopLevel } from '../RevisionTopLevel';

registerRefinement({
  type: 'choice-navigation',
  name: 'Tabbed navigation profile',
  supports(currentView, { structure, currentRevisionId }) {
    return !!structure.profile && structure.profile.indexOf('tabs') !== -1 && structure.type !== 'model';
  },
  refine({ instance: currentView }, context) {
    if (context.structure.type === 'model') {
      // Should not happen.
      return null;
    }

    return (
      <>
        <TabNavigation onChoice={context.push} currentId={currentView.id} choice={context.structure} />
        {context.currentRevisionId ? (
          <RevisionTopLevel
            onSaveRevision={context.onSaveRevision}
            instructions={
              currentView.type === 'model' && currentView.instructions
                ? currentView.instructions
                : currentView.description
            }
            readOnly={context.readMode || false}
          />
        ) : currentView.type === 'model' ? (
          <RevisionChoicePage model={currentView} />
        ) : null}
      </>
    );
  },
});
