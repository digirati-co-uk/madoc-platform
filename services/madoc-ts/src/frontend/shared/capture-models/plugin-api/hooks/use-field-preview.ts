import { createElement } from 'react';
import { BaseField } from '../../types/field-types';
import { useFieldPlugin } from './use-field-plugin';

export function useFieldPreview<Props extends BaseField>(props: Props) {
  const field = useFieldPlugin(props.type);

  return createElement(field.TextPreview, props);
}
