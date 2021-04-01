import React from 'react';
import { Revisions, useNavigation } from '@capture-models/editor';
import { isEntity } from '@capture-models/helpers';
import { EditorRenderingConfig, EditorSlots } from './EditorSlots';

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
          <EditorSlots.ViewField key={state.currentRevisionId || undefined} />
        </EditorSlots.EditorWrapper>
      );
    }

    if (state.revisionSubtree && isEntity(state.revisionSubtree)) {
      return (
        <EditorSlots.EditorWrapper>
          <EditorSlots.ViewEntity
            key={state.currentRevisionId || undefined}
            showTitle={state.revisionSubtreePath.length > 0}
          />
        </EditorSlots.EditorWrapper>
      );
    }
  }

  return null;
};
