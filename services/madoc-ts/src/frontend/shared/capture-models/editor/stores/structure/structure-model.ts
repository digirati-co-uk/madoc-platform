import { Action, Computed, ThunkOn } from 'easy-peasy';
import { CaptureModel, ModelFields } from '../../../types/capture-model';

export type StructureModel = {
  // Main store.
  structure: CaptureModel['structure'];

  // Computed
  tree: Computed<StructureModel, any[]>;

  // Currently focused item.
  focus: {
    index: number[];
    structure: Computed<StructureModel['focus'], CaptureModel['structure'], StructureModel>;
    breadcrumbs: Computed<StructureModel['focus'], Array<{ label: string; index: number[] }>, StructureModel>;
    setFocus: Action<StructureModel['focus'], number[]>;
    pushFocus: Action<StructureModel['focus'], number>;
    popFocus: Action<StructureModel['focus'], any | undefined>;
  };

  // Actions.
  replaceTopLevelStructure: Action<StructureModel, { structure: CaptureModel['structure']; force?: boolean }>;
  addStructureToChoice: Action<StructureModel, { index: number[]; structure: CaptureModel['structure'] }>;
  removeStructureFromChoice: Action<StructureModel, { index: number[] }>;
  setStructureLabel: Action<StructureModel, { index: number[]; label: string }>;
  setStructureDescription: Action<StructureModel, { index: number[]; description: string }>;
  setStructureInstructions: Action<StructureModel, { index: number[]; instructions: string }>;
  setStructureProfile: Action<StructureModel, { index: number[]; profile: string[] }>;
  setModelFields: Action<StructureModel, { index: number[]; fields: ModelFields }>;
  reorderChoices: Action<StructureModel, { index: number[]; startIndex: number; endIndex: number }>;
  removeField: Action<StructureModel, { term: string }>;

  onStructureChange: ThunkOn<StructureModel>;
};
