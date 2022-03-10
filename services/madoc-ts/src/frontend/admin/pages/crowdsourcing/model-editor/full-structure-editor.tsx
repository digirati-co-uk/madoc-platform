import React from 'react';
import { StructureEditor } from '../../../../shared/capture-models/editor/components/StructureEditor/StructureEditor';
import { DocumentStore } from '../../../../shared/capture-models/editor/stores/document/document-store';
import { StructureStore } from '../../../../shared/capture-models/editor/stores/structure/structure-store';
import { useFocusedStructureEditor } from '../../../../shared/capture-models/editor/stores/structure/use-focused-structure-editor';
import { CaptureModel } from '../../../../shared/capture-models/types/capture-model';
import { useApi } from '../../../../shared/hooks/use-api';
import { useModelEditorConfig } from './use-model-editor-config';

export const FullStructureEditor: React.FC = () => {
  const api = useApi();
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
  const { preventChangeDocument } = useModelEditorConfig();

  if (api.getIsServer() || preventChangeDocument) {
    return null;
  }

  return (
    <StructureEditor
      tree={tree}
      document={document}
      setLabel={setLabel}
      setDescription={setDescription}
      setInstructions={setInstructions}
      onAddChoice={addStructureToChoice}
      onAddModel={addStructureToChoice}
      pushFocus={focus.pushFocus as any}
      popFocus={focus.popFocus as any}
      setFocus={focus.setFocus as any}
      onRemove={removeStructureFromChoice}
      currentPath={currentPath}
      setModelFields={setModelFields}
      structure={current as CaptureModel['structure']}
      setProfile={setProfile}
      reorderChoices={reorderChoices}
    />
  );
};
