import { StructureType } from '../types/utility';
import { generateId } from './generate-id';

export function createChoice(choice: Partial<StructureType<'choice'>> = {}): StructureType<'choice'> {
  return {
    id: generateId(),
    label: choice.label || 'Untitled choice',
    type: 'choice',
    items: [],
    ...choice,
  };
}
