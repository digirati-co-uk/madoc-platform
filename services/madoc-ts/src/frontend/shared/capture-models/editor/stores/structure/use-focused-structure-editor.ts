import { useCallback } from 'react';
import { CaptureModel, ModelFields } from '../../../types/capture-model';
import { StructureStore } from './structure-store';

export function useFocusedStructureEditor() {
  const actions = StructureStore.useStoreActions(act => ({
    setLabel: act.setStructureLabel,
    setDescription: act.setStructureDescription,
    setInstructions: act.setStructureInstructions,
    setProfile: act.setStructureProfile,
    reorderChoices: act.reorderChoices,
    setModelFields: act.setModelFields,
    addStructureToChoice: act.addStructureToChoice,
    removeStructureFromChoice: act.removeStructureFromChoice,
  }));
  const index = StructureStore.useStoreState(state => state.focus.index);

  // Just calls the same functions with an added index parameter.
  const setLabel = useCallback((label: string) => actions.setLabel({ label, index }), [actions, index]);
  const setDescription = useCallback((description: string) => actions.setDescription({ description, index }), [
    actions,
    index,
  ]);
  const setInstructions = useCallback((instructions: string) => actions.setInstructions({ instructions, index }), [
    actions,
    index,
  ]);
  const setProfile = useCallback((profile: string[]) => actions.setProfile({ profile, index }), [actions, index]);
  const setModelFields = useCallback((fields: ModelFields) => actions.setModelFields({ fields, index }), [
    actions,
    index,
  ]);
  const reorderChoices = useCallback(
    (startIndex: number, endIndex: number) => actions.reorderChoices({ startIndex, endIndex, index }),
    [actions, index]
  );

  const removeStructureFromChoice = useCallback(
    (id: number) => {
      actions.removeStructureFromChoice({ index: [...index, id] });
    },
    [actions, index]
  );

  const addStructureToChoice = useCallback(
    (structure: CaptureModel['structure']) => {
      actions.addStructureToChoice({
        index,
        structure,
      });
    },
    [actions, index]
  );

  return {
    index,
    setLabel,
    setDescription,
    setInstructions,
    setProfile,
    setModelFields,
    reorderChoices,
    addStructureToChoice,
    removeStructureFromChoice,
  };
}
