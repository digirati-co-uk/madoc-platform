import { FieldHeader } from '@capture-models/editor';
import React from 'react';
import { useInlineProperties } from '../hooks/use-inline-properties';
import { useSlotContext } from './EditorSlots';

export const DefaultInlineProperties: React.FC<{
  label?: string;
  property: string;
  canInlineField?: boolean;
  disableRemoving?: boolean;
}> = props => {
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
      {props.label && showTitle ? <FieldHeader label={props.label} /> : null}
      <Slots.ManagePropertyList property={props.property} type={type}>
        {renderProperties()}
      </Slots.ManagePropertyList>
    </>
  );
};
