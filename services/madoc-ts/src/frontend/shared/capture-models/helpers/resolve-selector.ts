import { BaseSelector } from '../types/selector-types';

export function resolveSelector(selector: BaseSelector, revisionId?: string | null): BaseSelector {
  if (selector.revisedBy && revisionId) {
    for (const revisedSelector of selector.revisedBy) {
      if (revisedSelector.revisionId === revisionId) {
        return {
          ...selector,
          state: revisedSelector.state,
        };
      }
    }
  }
  return selector;
}
