import { createElement, useContext } from 'react';
import { BaseSelector, InjectedSelectorProps } from '../../types/selector-types';
import { PluginContext } from '../context';

export function useSelectorStatus<T extends BaseSelector>(
  props: T | undefined,
  actions: InjectedSelectorProps<T> = {}
) {
  const ctx = useContext(PluginContext);

  if (!props) {
    return null;
  }

  const selector = ctx.selectors[props.type];
  if (!selector) {
    throw new Error(`Plugin ${props.type} does not exist`);
  }

  return createElement(selector.FormComponent, { ...props, ...actions });
}
