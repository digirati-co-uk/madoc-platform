import React from 'react';
import { RoundedCard } from '@capture-models/editor';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { mapProperties } from '../utility/map-properties';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

export const DefaultSingleEntity: EditorRenderingConfig['SingleEntity'] = () => {
  const Slots = useSlotContext();
  const [entity] = useCurrentEntity();

  return (
    <>
      <Slots.Breadcrumbs />
      <RoundedCard size="small" interactive={false}>
        <Slots.AdjacentNavigation>
          <Slots.InlineSelector />
          {mapProperties(entity, ({ label, property, canInlineField }) => {
            return (
              <Slots.InlineProperties
                property={property}
                label={label}
                canInlineField={canInlineField}
                disableRemoving
              />
            );
          })}
        </Slots.AdjacentNavigation>
      </RoundedCard>
    </>
  );
};
