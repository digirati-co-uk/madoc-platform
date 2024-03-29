import React, { useEffect, useState } from 'react';
import { FieldInstance } from '../../editor/connected-components/FieldInstance';
import { useSelectorHelper } from '../../editor/stores/selectors/selector-helper';
import { BaseField } from '../../types/field-types';
import { useSlotConfiguration } from './EditorSlots';
import { FieldSet } from '../../../form/FieldSet';
import { useResolvedSelector } from '../hooks/use-resolved-selector';
import { useResolvedDependant } from '../hooks/use-resolved-dependant';

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
  const [selector, { isBlockingForm }] = useResolvedSelector(field);
  const dependantValue = useResolvedDependant(field);
  const disableForm = isBlockingForm;

  useEffect(() => {
    if (selector) {
      if (isHighlighted) {
        return helper.highlight(selector.id);
      } else {
        helper.clearHighlight(selector.id);
      }
    }
  }, []);

  const onFocus = (e: React.FocusEvent<HTMLElement>) => {
    if (e.currentTarget !== e.target && field && field.selector) {
      setIsHighlighted(true);
    }
  };

  const onBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (e.currentTarget !== e.target && field && field.selector) {
      setIsHighlighted(false);
    }
  };

  if (immutable) {
    // @todo come back to this and make FieldInstance accept "disabled"
    return null;
  }

  if (!dependantValue) {
    return null;
  }
  return (
    <FieldSet
      onFocus={onFocus}
      onBlur={onBlur}
      data-field-id={field.id}
      aria-label={field.label}
      // This aria-description is still in draft... (causes react error)
      data-aria-description={field.description}
    >
      <FieldInstance
        disabled={disableForm}
        key={field.revises ? field.revises : field.id}
        field={field}
        property={property}
        path={path}
        hideHeader={hideHeader}
      />
    </FieldSet>
  );
};
