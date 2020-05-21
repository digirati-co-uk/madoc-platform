import { DocumentStore, StructureEditor, StructureStore, useFocusedStructureEditor } from '@capture-models/editor';
import { CaptureModel } from '@capture-models/types';
import React from 'react';

export const FullStructureEditor: React.FC = () => {
  const document = DocumentStore.useStoreState(state => state.document);
  const tree = StructureStore.useStoreState(state => state.tree);
  const focus = StructureStore.useStoreActions(act => act.focus);
  const current = StructureStore.useStoreState(state => state.focus.structure);
  const currentPath = StructureStore.useStoreState(state => state.focus.index);
  const {
    setLabel,
    setDescription,
    setInstructions,
    addStructureToChoice,
    setModelFields,
    removeStructureFromChoice,
    setProfile,
    reorderChoices,
  } = useFocusedStructureEditor();

  return (
    <StructureEditor
      tree={tree}
      document={document}
      setLabel={setLabel}
      setDescription={setDescription}
      setInstructions={setInstructions}
      onAddChoice={addStructureToChoice}
      onAddModel={addStructureToChoice}
      pushFocus={focus.pushFocus}
      popFocus={focus.popFocus}
      setFocus={focus.setFocus}
      onRemove={removeStructureFromChoice}
      currentPath={currentPath}
      setModelFields={setModelFields}
      structure={current as CaptureModel['structure']}
      setProfile={setProfile}
      reorderChoices={reorderChoices}
    />
  );
};
