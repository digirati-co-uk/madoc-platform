import React from 'react';
import { useNavigation } from '../../editor/hooks/useNavigation';
import { Revisions } from '../../editor/stores/revisions/index';
import { isEntity } from '../../helpers/is-entity';
import { EditorRenderingConfig, EditorSlots, ProfileProvider } from './EditorSlots';

export const DefaultTopLevelEditor: EditorRenderingConfig['TopLevelEditor'] = () => {
  const state = Revisions.useStoreState(s => ({
    currentRevisionId: s.currentRevisionId,
    revisionSubtreeField: s.revisionSubtreeField,
    revisionSubtree: s.revisionSubtree,
    revisionSubtreePath: s.revisionSubtreePath,
  }));
  const [currentView] = useNavigation();


  if (currentView && currentView.type === 'choice' && !state.currentRevisionId && !state.revisionSubtree) {
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

  // We get to this spot if we do not have any auto selecting revisions. This
  // is the point where we should show the revision list [RevisionChoicePage / RevisionList]
  return null;
};
