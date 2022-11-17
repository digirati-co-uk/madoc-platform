import { BaseSelector } from '../types/selector-types';
import { generateId } from './generate-id';

export function forkSelectorEditMode(selector: BaseSelector, revisionId: string, state: any) {
  return {
    ...selector,
    id: generateId(),
    revisionId: revisionId,
    revises: selector.id,
    revisedBy: [],
    state: state,
  };
}
