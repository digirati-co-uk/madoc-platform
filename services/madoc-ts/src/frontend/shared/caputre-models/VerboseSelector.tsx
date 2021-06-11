import { Revisions, RoundedCard } from '@capture-models/editor';
import { useSelectorStatus } from '@capture-models/plugin-api';
import { BaseSelector } from '@capture-models/types';
import React, { useCallback, useEffect } from 'react';

type VerboseSelectorProps = {
  selector: BaseSelector;
  readOnly?: boolean;
  isTopLevel?: boolean;
};

export const VerboseSelector: React.FC<VerboseSelectorProps> = ({ selector, readOnly, isTopLevel }) => {
  const updateSelectorValue = Revisions.useStoreActions(a => a.updateSelector);
  const chooseSelector = Revisions.useStoreActions(a => a.chooseSelector);
  const clearSelector = Revisions.useStoreActions(a => a.clearSelector) as any;
  const currentSelectorId = Revisions.useStoreState(s => s.selector.currentSelectorId);
  const previewData = Revisions.useStoreState(s => s.selector.selectorPreviewData);

  const componentWillUnmount = useCallback(() => {
    clearSelector();
  }, [clearSelector]);

  useEffect(() => componentWillUnmount, [componentWillUnmount]);

  const updateSelector = useCallback(
    state => {
      if (selector) {
        selector.state = state;
        updateSelectorValue({ selectorId: selector.id, state });
      }
    },
    [selector, updateSelectorValue]
  );

  if (
    selector.revisedBy &&
    selector.revisedBy.length >= 1 &&
    selector.revisedBy[0].state
  ) {
    selector.state = selector.revisedBy[0].state;
  }

  const selectorComponent = useSelectorStatus(selector, {
    updateSelector: updateSelector,
    chooseSelector: chooseSelector ? (selectorId: string) => chooseSelector({ selectorId }) : undefined,
    clearSelector,
    currentSelectorId: currentSelectorId ? currentSelectorId : undefined,
    selectorPreview: selector ? previewData[selector.id] : undefined,
    readOnly,
    isTopLevel,
  });

  return <RoundedCard>{selectorComponent}</RoundedCard>;
};
