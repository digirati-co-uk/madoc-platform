import { useSelectorStatus } from '../../plugin-api/hooks/use-selector-status';
import { Revisions } from '../stores/revisions';
import React, { useCallback, useEffect } from 'react';
import { useSelectorWithId } from '../stores/selectors/selector-hooks';

type EntityInstanceProps = {
  selectorId: string;
  readOnly?: boolean;
  isTopLevel?: boolean;
};

export const EntityInstance: React.FC<EntityInstanceProps> = ({ selectorId, readOnly, isTopLevel }) => {
  const selector = useSelectorWithId(selectorId);
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
    (state: any) => {
      if (selector) {
        updateSelectorValue({ selectorId: selector.id, state });
      }
    },
    [selector, updateSelectorValue]
  );

  return useSelectorStatus(selector, {
    updateSelector: updateSelector,
    chooseSelector: chooseSelector ? (_selectorId: string) => chooseSelector({ selectorId: _selectorId }) : undefined,
    clearSelector,
    currentSelectorId: currentSelectorId ? currentSelectorId : undefined,
    selectorPreview: selector ? previewData[selector.id] : undefined,
    readOnly,
    isTopLevel,
  });
};
