import { FieldHeader } from '@capture-models/editor';
import React from 'react';
import { useInlineProperties } from '../hooks/use-inline-properties';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

export const DefaultInlineProperties: EditorRenderingConfig['InlineProperties'] = props => {
  const [renderProperties, { type, isEmpty, showTitle }] = useInlineProperties(props.property, {
    canInlineField: props.canInlineField,
    disableRemoving: props.disableRemoving,
  });
  const Slots = useSlotContext();

  if (isEmpty) {
    return null;
  }

  return (
    <>
      {props.label && showTitle ? <FieldHeader label={props.label} description={props.description} /> : null}
      <Slots.ManagePropertyList property={props.property} type={type}>
        {renderProperties()}
      </Slots.ManagePropertyList>
    </>
  );
};
