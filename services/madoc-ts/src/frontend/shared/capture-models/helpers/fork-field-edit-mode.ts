import { BaseField } from '../types/field-types';
import { BaseSelector } from '../types/selector-types';
import { formPropertyValue } from './fork-field';

export function forkFieldEditMode(field: BaseField, revisionId: string): { newSelectors: BaseSelector[] } {
  if (revisionId && field.revision !== revisionId) {
    const previousSelectorId = field.selector?.id;
    // Fork field.
    formPropertyValue(field, {
      clone: false,
      generateNewId: true,
      revision: revisionId,
      forkValue: true,
      revisesFork: true,
    });

    if (previousSelectorId !== field.selector?.id) {
      // We have a selector to update..
      return {
        newSelectors: field.selector ? [field.selector] : [],
      };
    }
  }

  return {
    newSelectors: [],
  };
}
