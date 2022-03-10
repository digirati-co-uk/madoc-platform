import * as React from 'react';
import { CaptureModel } from '../../../types/capture-model';
import { StructureStore } from './structure-store';
import { useFocusedStructureEditor } from './use-focused-structure-editor';

export default { title: 'Stores/Structure Store' };

const model: CaptureModel = require('../../../../../../../fixtures/simple.json');

const Test: React.FC = () => {
  const tree = StructureStore.useStoreState(state => state.tree);
  const focus = StructureStore.useStoreActions(act => act.focus);
  const breadcrumbs = StructureStore.useStoreState(state => state.focus.breadcrumbs);
  const current = StructureStore.useStoreState(state => state.focus);
  const removeStructureFromChoice = StructureStore.useStoreActions(act => act.removeStructureFromChoice);
  const reorderChoices = StructureStore.useStoreActions(act => act.reorderChoices);
  const { setLabel } = useFocusedStructureEditor();

  // @todo implement up and down reordering (simple).

  return (
    <div>
      <button onClick={() => setLabel('to something else')}>Set label</button>
      <button onClick={() => removeStructureFromChoice({ index: current.index })}>Remove</button>
      <button onClick={() => reorderChoices({ index: current.index, startIndex: 0, endIndex: 1 })}>
        Flip first 2 items
      </button>
      <h1>{current.structure.label}</h1>
    </div>
  );
};

export const Simple: React.FC = () => (
  <StructureStore.Provider initialData={{ captureModel: model }}>
    <Test />
  </StructureStore.Provider>
);
