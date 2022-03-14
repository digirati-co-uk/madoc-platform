import React from 'react';
import { useSelectorStatus } from '../../../plugin-api/hooks/use-selector-status';
import { BaseSelector } from '../../../types/selector-types';

export const SelectorPreview: React.FC<{
  selector?: BaseSelector;
  chooseSelector?: (payload: { selectorId: string }) => void;
  currentSelectorId?: string | null;
  selectorPreview?: any;
}> = ({ chooseSelector, selectorPreview, currentSelectorId, selector }) => {
  return useSelectorStatus(selector, {
    currentSelectorId: currentSelectorId ? currentSelectorId : undefined,
    chooseSelector: selectorId => (chooseSelector ? chooseSelector({ selectorId }) : undefined),
    selectorPreview,
    readOnly: true,
  });
};
