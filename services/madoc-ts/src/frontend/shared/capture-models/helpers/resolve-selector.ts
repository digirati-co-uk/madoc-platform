import { BaseSelector } from '../types/selector-types';

export function resolveSelector(
  selector: BaseSelector,
  revisionId?: string | null,
  resolveLatest?: boolean
): BaseSelector {
  if (selector.revisedBy && selector.revisedBy.length > 0 && resolveLatest) {
    return selector.revisedBy[selector.revisedBy.length - 1];
  }

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
