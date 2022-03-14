import { Draft } from 'immer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CaptureModel } from '../../types/capture-model';
import { BaseField } from '../../types/field-types';
import { BaseSelector } from '../../types/selector-types';
import { CurrentSelectorState, UseCurrentSelector } from '../../types/to-be-removed';
import { useContext } from './context';

/**
 * @deprecated use revisions instead
 */
export function useCurrentSelector<Selector extends BaseSelector = BaseSelector>(): UseCurrentSelector<Selector> {
  const {
    currentSelectorPath,
    currentSelector,
    setCurrentSelector,
    updateCustomSelector,
    currentSelectorOriginalState,
  } = useContext();

  const confirmSelector = useCallback(() => {
    // sets the current selector to null
    setCurrentSelector(null);
  }, [setCurrentSelector]);

  const updateSelector = useCallback(
    (state: BaseSelector['state'], confirm = false) => {
      if (currentSelectorPath) {
        updateCustomSelector(currentSelectorPath, state);
        if (confirm) {
          confirmSelector();
        }
      }
    },
    [confirmSelector, currentSelectorPath, updateCustomSelector]
  );

  const resetSelector = useCallback(() => {
    // sets the selector to `currentSelectorOriginalState`
    updateSelector(currentSelectorOriginalState, true);
  }, [currentSelectorOriginalState, updateSelector]);

  return useMemo(
    () => ({
      currentSelectorPath,
      confirmSelector,
      currentSelector,
      currentSelectorOriginalState,
      resetSelector,
      setCurrentSelector,
      updateCustomSelector,
      updateSelector,
    }),
    [
      currentSelectorPath,
      confirmSelector,
      currentSelector,
      currentSelectorOriginalState,
      resetSelector,
      setCurrentSelector,
      updateCustomSelector,
      updateSelector,
    ]
  );
}

/**
 * @deprecated use revisions instead
 */
export function useInternalCurrentSelectorState(
  captureModel: CaptureModel,
  updateField: (
    path: Array<[string, number]>,
    cb: (field: Draft<BaseField>, draft: Draft<CaptureModel>) => void
  ) => void
): CurrentSelectorState {
  const [currentSelectorPath, setCurrentSelector] = useState<Array<[string, number]> | null>(null);

  const [currentSelectorOriginalState, setCurrentSelectorOriginalState] = useState<BaseSelector['state']>(null);

  const [currentSelector, setCurrentSelectorObj] = useState();

  // @todo there is a gap for fields that want to provide selectors. We need the
  //   "currentSelector" to be the source of truth for if there is currently a
  //   selector, and then a wrapper to set the selector object to whatever a field
  //   may want. The API will provide a callback for when a selector is saved,
  //   or could be updated through props. Either a push or pull interaction.

  const fieldSelector = useMemo(() => {
    if (!currentSelectorPath) {
      return null;
    }
    return (currentSelectorPath.reduce((acc: CaptureModel['document'], [path, idx]) => {
      return acc.properties[path][idx] as CaptureModel['document'];
    }, captureModel.document) as CaptureModel['document'] | BaseField).selector;
  }, [captureModel.document, currentSelectorPath]);

  useEffect(() => {
    setCurrentSelectorObj(fieldSelector ? fieldSelector.state : null);
  }, [fieldSelector]);

  useEffect(() => {
    if (currentSelectorPath && fieldSelector) {
      setCurrentSelectorOriginalState(fieldSelector ? fieldSelector.state : null);
    }
    // This shouldn't change if the document changes. The doc will
    // change quite often, but this only needs to track the original
    // state when the selector path changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSelectorPath]);

  const updateCustomSelector = useCallback(
    <Selector extends BaseSelector>(path: Array<[string, number]>, value: Selector['state']) => {
      // Updates the capture model.
      updateField(path, field => {
        if (field.selector) {
          field.selector.state = value;
        }
      });
    },
    [updateField]
  );

  return {
    currentSelectorPath,
    currentSelector,
    currentSelectorOriginalState,
    updateCustomSelector,
    setCurrentSelector,
  };
}
