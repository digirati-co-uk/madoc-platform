import React from 'react';
import { FieldHeader } from '@capture-models/editor';
import { getEntityLabel } from '../../utility/get-entity-label';
import { ModifiedStatus } from '../features/ModifiedStatus';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { useEntityDetails } from '../hooks/use-entity-details';
import { useHighlightSelector } from '../hooks/use-highlight-selector';
import { mapProperties } from '../utility/map-properties';
import { EditorRenderingConfig, useProfileOverride, useSlotContext } from './EditorSlots';

export const DefaultSingleEntity: EditorRenderingConfig['SingleEntity'] = props => {
  const { showTitle } = props;
  const Slots = useSlotContext();
  const [entity] = useCurrentEntity();
  const { isModified } = useEntityDetails(entity);
  const entityLabel = getEntityLabel(entity);
  const ProfileSpecificComponent = useProfileOverride('SingleEntity');

  useHighlightSelector(entity.selector?.id);

  if (ProfileSpecificComponent) {
    return <ProfileSpecificComponent {...props} />;
  }

  return (
    <React.Fragment key={entity.id}>
      <Slots.Breadcrumbs />

      {entityLabel && showTitle ? <FieldHeader label={entityLabel} description={entity.description} /> : null}
      <Slots.AdjacentNavigation>
        {isModified && <ModifiedStatus />}
        <Slots.InlineSelector />
        {mapProperties(entity, ({ type, hasSelector, label, description, property, canInlineField }) => {
          return (
            <Slots.InlineProperties
              type={type}
              property={property}
              label={label}
              description={description}
              canInlineField={canInlineField}
              hasSelector={hasSelector}
              disableRemoving
            />
          );
        })}
      </Slots.AdjacentNavigation>
    </React.Fragment>
  );
};
