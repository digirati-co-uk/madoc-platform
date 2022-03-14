import { StructureType } from '../types/utility';

export function itemFromIndex<C extends string = 'choice', ST extends StructureType<C> = StructureType<C>>(
  state: any,
  index: number[]
): ST {
  return index.reduce((acc, next) => (acc as StructureType<'choice'>).items[next], state.structure);
}
