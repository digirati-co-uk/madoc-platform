import * as React from 'react';
import { CaptureModel } from '../../../types/capture-model';
import { DocumentStore } from '../../stores/document/document-store';
import { useFocusedStructureEditor } from '../../stores/structure/use-focused-structure-editor';
import { StructureEditor } from './StructureEditor';
import { StructureStore } from '../../stores/structure/structure-store';

import model from '../../../../../../../fixtures/simple.json';

export default { title: 'Capture model editor components/Structure Editor' };
const withStructure = (Component: React.FC): React.FC => () => (
  <DocumentStore.Provider initialData={{ captureModel: model }}>
    <StructureStore.Provider initialData={{ captureModel: model }}>
      <Component />
    </StructureStore.Provider>
  </DocumentStore.Provider>
);

export const Simple: React.FC = withStructure(() => {
  const document = DocumentStore.useStoreState(state => state.document);
  const tree = StructureStore.useStoreState(state => state.tree);
  const focus = StructureStore.useStoreActions(act => act.focus);
  const current = StructureStore.useStoreState(state => state.focus.structure);
  const currentPath = StructureStore.useStoreState(state => state.focus.index);
  const {
    setLabel,
    setDescription,
    addStructureToChoice,
    setModelFields,
    removeStructureFromChoice,
    setProfile,
    setInstructions,
    reorderChoices,
  } = useFocusedStructureEditor();

  return (
    <StructureEditor
      tree={tree}
      document={document}
      setLabel={setLabel}
      setDescription={setDescription}
      onAddChoice={addStructureToChoice}
      onAddModel={addStructureToChoice}
      setProfile={setProfile}
      reorderChoices={reorderChoices}
      setInstructions={setInstructions}
      pushFocus={focus.pushFocus}
      popFocus={focus.popFocus}
      setFocus={focus.setFocus}
      onRemove={removeStructureFromChoice}
      currentPath={currentPath}
      setModelFields={setModelFields}
      structure={current as CaptureModel['structure']}
    />
  );
});
