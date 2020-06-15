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
  const chooseSelector = Revisions.useStoreActions(a => a.chooseSelector);
  const clearSelector = Revisions.useStoreActions(a => a.clearSelector) as any;
  const currentSelectorId = Revisions.useStoreState(s => s.selector.currentSelectorId);

  const componentWillUnmount = useCallback(() => {
    clearSelector();
  }, [clearSelector]);

  useEffect(() => componentWillUnmount, [componentWillUnmount]);

  const selectorComponent = useSelectorStatus(selector, {
    chooseSelector: chooseSelector ? (selectorId: string) => chooseSelector({ selectorId }) : undefined,
    clearSelector,
    currentSelectorId: currentSelectorId ? currentSelectorId : undefined,
    readOnly,
    isTopLevel,
  });

  return <RoundedCard>{selectorComponent}</RoundedCard>;
};
