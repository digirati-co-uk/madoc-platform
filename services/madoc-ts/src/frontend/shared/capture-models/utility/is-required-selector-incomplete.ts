import { BaseSelector } from '../types/selector-types';

export function isRequiredSelectorIncomplete(selector?: BaseSelector) {
  return !!(selector && selector.required && !selector.state);
}
