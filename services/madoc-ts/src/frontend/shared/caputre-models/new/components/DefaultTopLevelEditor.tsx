import React from 'react';
import { Revisions, useNavigation } from '@capture-models/editor';
import { isEntity } from '@capture-models/helpers';
import { EditorRenderingConfig, EditorSlots, ProfileProvider } from './EditorSlots';

export const DefaultTopLevelEditor: EditorRenderingConfig['TopLevelEditor'] = () => {
  const state = Revisions.useStoreState(s => s);
  const [currentView] = useNavigation();

  if (currentView && currentView.type === 'choice') {
    return <EditorSlots.Choice key={state.currentRevisionId || undefined} />;
  }

  if (!currentView || currentView.type === 'model') {
    if (state.revisionSubtreeField && !isEntity(state.revisionSubtreeField)) {
      return (
        <EditorSlots.EditorWrapper>
          <ProfileProvider profile={state.revisionSubtreeField.profile}>
            <EditorSlots.ViewField key={state.currentRevisionId || undefined} />
          </ProfileProvider>
        </EditorSlots.EditorWrapper>
      );
    }

    if (state.revisionSubtree && isEntity(state.revisionSubtree)) {
      return (
        <EditorSlots.EditorWrapper>
          <ProfileProvider profile={state.revisionSubtree.profile}>
            <EditorSlots.ViewEntity
              key={state.currentRevisionId || undefined}
              showTitle={state.revisionSubtreePath.length > 0}
            />
          </ProfileProvider>
        </EditorSlots.EditorWrapper>
      );
    }
  }

  // We get to this spot if we do not have any auto selecting revisions. This
  // is the point where we should show the revision list [RevisionChoicePage / RevisionList]
  return null;
};
