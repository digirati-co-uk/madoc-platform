import { CaptureModel } from '../types/capture-model';
import { StructureType } from '../types/utility';
import { filterEmptyStructureFields } from './filter-empty-structure-fields';

export function filterSingleStructureModel(model: StructureType<'model'>, document: CaptureModel['document']) {
  const filteredFields = filterEmptyStructureFields(model.fields, document);

  if (filteredFields.length === 0) {
    return undefined;
  }

  return {
    ...model,
    fields: filteredFields,
  };
}

export function filterSingleStructureChoice(model: StructureType<'choice'>, document: CaptureModel['document']) {
  const filteredChoices: any[] = [];
  for (const choice of model.items) {
    if (choice.type === 'choice') {
      const filteredChoice = filterSingleStructureChoice(choice, document);
      if (filteredChoice) {
        filteredChoices.push(filteredChoice);
      }
    }

    if (choice.type === 'model') {
      const filteredModel = filterSingleStructureModel(choice, document);
      if (filteredModel) {
        filteredChoices.push(filteredModel);
      }
    }
  }

  if (filteredChoices.length === 0) {
    return undefined;
  }

  return {
    ...model,
    items: filteredChoices,
  };
}

export function filterEmptyStructures(model: CaptureModel): CaptureModel['structure'] | undefined {
  const rootStructure = model.structure;
  if (rootStructure.type === 'choice') {
    return filterSingleStructureChoice(rootStructure, model.document);
  } else {
    return filterSingleStructureModel(rootStructure, model.document);
  }
}
