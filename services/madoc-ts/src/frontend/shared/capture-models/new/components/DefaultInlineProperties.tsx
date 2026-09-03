import React from 'react';
import { FieldHeader } from '../../editor/components/FieldHeader/FieldHeader';
import { useModelTranslation } from '../../hooks/use-model-translation';
import { BaseField } from '../../types/field-types';
import { isEmptyFieldList } from '../../utility/is-field-list-empty';
import { useInlineProperties } from '../hooks/use-inline-properties';
import { useTwoLevelInlineMode } from '../hooks/use-two-level-inline-mode';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

export const DefaultInlineProperties: EditorRenderingConfig['InlineProperties'] = props => {
  const { t: tModel } = useModelTranslation();
  const twoLevelInlineMode = useTwoLevelInlineMode();
  const [renderProperties, { type, isEmpty, showTitle, propertyList }] = useInlineProperties(props.property, {
    canInlineField: props.canInlineField,
    disableRemoving: props.disableRemoving,
  });
  const Slots = useSlotContext();
  const showEmptyMultipleFieldTitle =
    twoLevelInlineMode &&
    type === 'field' &&
    !!propertyList[0]?.allowMultiple &&
    isEmptyFieldList(propertyList as BaseField[]);

  if (isEmpty) {
    return null;
  }

  return (
    <>
      {props.label && (showTitle || showEmptyMultipleFieldTitle) ? (
        <FieldHeader
          label={tModel(props.label)}
          labelFor={props.label}
          description={props.description ? tModel(props.description) : undefined}
        />
      ) : null}
      {twoLevelInlineMode ? (
        renderProperties()
      ) : (
        <Slots.ManagePropertyList property={props.property} type={type}>
          {renderProperties()}
        </Slots.ManagePropertyList>
      )}
    </>
  );
};
