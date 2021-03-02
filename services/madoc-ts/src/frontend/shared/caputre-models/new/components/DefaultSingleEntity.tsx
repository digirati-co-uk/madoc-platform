import React from 'react';
import { RoundedCard } from '@capture-models/editor';
import { ProgressIcon } from '../../../atoms/ProgressIcon';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { useEntityDetails } from '../hooks/use-entity-details';
import { mapProperties } from '../utility/map-properties';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

export const DefaultSingleEntity: EditorRenderingConfig['SingleEntity'] = () => {
  const Slots = useSlotContext();
  const [entity] = useCurrentEntity();
  const { isModified } = useEntityDetails(entity);

  return (
    <>
      <Slots.Breadcrumbs />
      <RoundedCard size="small" interactive={false}>
        <Slots.AdjacentNavigation>
          {isModified && <ProgressIcon />}
          <Slots.InlineSelector />
          {mapProperties(entity, ({ label, description, property, canInlineField }) => {
            return (
              <Slots.InlineProperties
                property={property}
                label={label}
                description={description}
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
