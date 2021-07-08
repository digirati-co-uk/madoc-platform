import { FieldInstance, FieldPreview, useSelectorHelper } from '@capture-models/editor';
import { BaseField } from '@capture-models/types';
import React, { useEffect, useState } from 'react';
import { useSlotConfiguration } from './EditorSlots';

export const DefaultFieldInstance: React.FC<{
  field: BaseField;
  property: string;
  path: Array<[string, string]>;
  hideHeader?: boolean;
}> = ({ field, property, path, hideHeader }) => {
  const helper = useSelectorHelper();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const { immutableFields = [] } = useSlotConfiguration();
  const immutable = immutableFields.indexOf(property) !== -1;

  useEffect(() => {
    if (field?.selector) {
      if (isHighlighted) {
        return helper.highlight(field.selector.id);
      } else {
        helper.clearHighlight(field.selector.id);
      }
    }
  });

  const onFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget !== e.target && field && field.selector) {
      setIsHighlighted(true);
    }
  };

  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget !== e.target && field && field.selector) {
      setIsHighlighted(false);
    }
  };

  if (immutable) {
    // @todo come back to this and make FieldInstance accept "disabled"
    return null;
  }

  return (
    <span onFocus={onFocus} onBlur={onBlur}>
      <FieldInstance field={field} property={property} path={path} hideHeader={hideHeader} />
    </span>
  );
};
