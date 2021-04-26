import React from 'react';
import { FieldHeader } from '@capture-models/editor';
import { ProgressIcon } from '../../../atoms/ProgressIcon';
import { getEntityLabel } from '../../utility/get-entity-label';
import { ModifiedStatus } from '../features/ModifiedStatus';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { useEntityDetails } from '../hooks/use-entity-details';
import { mapProperties } from '../utility/map-properties';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

export const DefaultSingleEntity: EditorRenderingConfig['SingleEntity'] = ({ showTitle = true }) => {
  const Slots = useSlotContext();
  const [entity] = useCurrentEntity();
  const { isModified } = useEntityDetails(entity);

  const entityLabel = getEntityLabel(entity);

  return (
    <>
      <Slots.Breadcrumbs />

      {entityLabel && showTitle ? <FieldHeader label={entityLabel} description={entity.description} /> : null}
      <Slots.AdjacentNavigation>
        {isModified && <ModifiedStatus />}
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
    </>
  );
};
