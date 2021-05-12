import React from 'react';
import { FieldHeader } from '@capture-models/editor';
import { getEntityLabel } from '../../utility/get-entity-label';
import { ModifiedStatus } from '../features/ModifiedStatus';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { useEntityDetails } from '../hooks/use-entity-details';
import { mapProperties } from '../utility/map-properties';
import { EditorRenderingConfig, useProfileOverride, useSlotContext } from './EditorSlots';

export const DefaultSingleEntity: EditorRenderingConfig['SingleEntity'] = props => {
  const { showTitle } = props;
  const Slots = useSlotContext();
  const [entity] = useCurrentEntity();
  const { isModified } = useEntityDetails(entity);
  const entityLabel = getEntityLabel(entity);
  const ProfileSpecificComponent = useProfileOverride('SingleEntity');

  if (ProfileSpecificComponent) {
    return <ProfileSpecificComponent {...props} />;
  }

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
