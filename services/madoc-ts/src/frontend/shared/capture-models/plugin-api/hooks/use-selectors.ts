import React, { useContext } from 'react';
import { BaseSelector, InjectedSelectorProps } from '../../types/selector-types';
import { PluginContext } from '../context';

export function useSelectors<T extends BaseSelector>(
  selectorProps: T[] | undefined,
  contentType: string,
  customOptions: {
    updateSelector?: any;
    selectorPreview?: any;
    updateSelectorPreview?: (data: { selectorId: string; preview: string }) => void;
    readOnly?: boolean;
    isTopLevel?: boolean;
    isAdjacent?: boolean;
    hidden?: boolean;
    defaultState?: any;
    onClick?: (selector: T & InjectedSelectorProps<T['state']>) => void;
  }
) {
  const {
    updateSelector = null,
    selectorPreview = null,
    updateSelectorPreview,
    readOnly = false,
    defaultState = null,
    isTopLevel = false,
    isAdjacent = false,
    onClick,
    hidden,
  } = customOptions;
  const ctx = useContext(PluginContext);
  if (!selectorProps) {
    return [];
  }

  const returnSelectors = [];
  for (const props of selectorProps) {
    const selector = ctx.selectors[props.type];
    if (!selector) {
      // throw new Error('Plugin does not exist');
      continue;
    }

    if (!props.state && !readOnly) {
      props.state = defaultState;
    }

    // if (props.state) {
    returnSelectors.push([
      React.createElement(selector.contentComponents[contentType], {
        ...props,
        key: props.id,
        readOnly,
        updateSelectorPreview,
        selectorPreview,
        updateSelector,
        isTopLevel,
        isAdjacent,
        onClick,
        hidden,
      } as T & InjectedSelectorProps<T>),
    ]);
    // }
  }

  return returnSelectors;
}
