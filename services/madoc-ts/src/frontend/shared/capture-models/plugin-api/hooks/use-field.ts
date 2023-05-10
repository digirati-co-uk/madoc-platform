import { createElement } from 'react';
import { BaseField } from '../../types/field-types';
import { useFieldPlugin } from './use-field-plugin';

export function useField<Props extends BaseField>(
  props: Props,
  value: Props['value'],
  updateValue: (b: Props['value']) => void,
  options: { disabled?: boolean } = {}
) {
  const field = useFieldPlugin(props.type);

  return createElement(field.Component, { ...props, value, updateValue, ...options });
}
