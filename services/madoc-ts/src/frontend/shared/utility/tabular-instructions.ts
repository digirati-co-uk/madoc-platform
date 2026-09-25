import type { CaptureModel } from '../capture-models/types/capture-model';

export function resolveTabularInstructions(
  projectInstructions: string | undefined,
  fallbacks: Array<string | null | undefined>
): string {
  return typeof projectInstructions === 'string'
    ? projectInstructions
    : fallbacks.find(value => value?.trim())?.trim() || '';
}

export function getTabularModelInstructions(model: CaptureModel): string {
  const firstView = (structure: CaptureModel['structure']): string => {
    if (structure.type === 'model') {
      return structure.instructions || structure.description || '';
    }
    return structure.items.map(firstView).find(text => text.trim()) || '';
  };
  return resolveTabularInstructions(undefined, [firstView(model.structure), model.document.instructions]);
}
