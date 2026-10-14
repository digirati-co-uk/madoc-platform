import React, { useEffect, useState } from 'react';
import { FieldInstance } from '../../editor/connected-components/FieldInstance';
import { useSelectorHelper } from '../../editor/stores/selectors/selector-helper';
import { BaseField } from '../../types/field-types';
import { useSlotContext } from './EditorSlots';
import { FieldSet } from '../../../form/FieldSet';
import { useResolvedSelector } from '../hooks/use-resolved-selector';
import { useResolvedDependant } from '../hooks/use-resolved-dependant';
import { useTwoLevelInlineMode } from '../hooks/use-two-level-inline-mode';

interface DefaultFieldInstanceProps {
  field: BaseField;
  property: string;
  path: Array<[string, string]>;
  hideHeader?: boolean;
}

export function DefaultFieldInstance({ field, property, path, hideHeader }: DefaultFieldInstanceProps) {
  const helper = useSelectorHelper();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const Slots = useSlotContext();
  const { immutableFields = [], allowEditing } = Slots.configuration;
  const twoLevelInlineMode = useTwoLevelInlineMode();
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
  if (twoLevelInlineMode && !allowEditing) {
    return <Slots.InlineField field={field} property={property} path={path} canRemove={false} readonly />;
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
        hideHeader={hideHeader && !selector}
      />
    </FieldSet>
  );
}
