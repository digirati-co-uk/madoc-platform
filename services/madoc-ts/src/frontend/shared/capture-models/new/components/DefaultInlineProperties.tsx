import React from 'react';
import { FieldHeader } from '../../editor/components/FieldHeader/FieldHeader';
import { useModelTranslation } from '../../hooks/use-model-translation';
import { useInlineProperties } from '../hooks/use-inline-properties';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

export const DefaultInlineProperties: EditorRenderingConfig['InlineProperties'] = props => {
  const { t: tModel } = useModelTranslation();
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
      {props.label && showTitle ? (
        <FieldHeader
          label={tModel(props.label)}
          description={props.description ? tModel(props.description) : undefined}
        />
      ) : null}
      <Slots.ManagePropertyList property={props.property} type={type}>
        {renderProperties()}
      </Slots.ManagePropertyList>
    </>
  );
};
