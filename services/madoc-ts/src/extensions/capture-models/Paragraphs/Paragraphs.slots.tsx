import React from 'react';
import styled, { css } from 'styled-components';
import { InlineReadonlyValue } from '../../../frontend/shared/caputre-models/new/components/DefaultInlineField';
import { ProfileConfig, useSlotContext } from '../../../frontend/shared/caputre-models/new/components/EditorSlots';
import { ModifiedStatus } from '../../../frontend/shared/caputre-models/new/features/ModifiedStatus';
import { useCurrentEntity } from '../../../frontend/shared/caputre-models/new/hooks/use-current-entity';
import { useEntityDetails } from '../../../frontend/shared/caputre-models/new/hooks/use-entity-details';
import { useFieldDetails } from '../../../frontend/shared/caputre-models/new/hooks/use-field-details';
import { mapProperties } from '../../../frontend/shared/caputre-models/new/utility/map-properties';
import { getEntityLabel } from '../../../frontend/shared/caputre-models/utility/get-entity-label';
import { DocumentPreview } from '../../../frontend/shared/caputre-models/DocumentPreview';

const InlineLine = styled.div<{ $isModified?: boolean }>`
  border-left: 3px solid transparent;
  cursor: pointer;
  padding-left: 0.5em;
  margin-bottom: 0.5em;

  &:hover {
    border-left-color: #4a67e4;
  }

  ${props =>
    props.$isModified &&
    css`
      border-left-color: #e38627;

      &:hover {
        border-left-color: #b76909;
      }
    `}
`;

const InlineParagraphEntity: ProfileConfig['InlineEntity'] = props => {
  const { entity, chooseEntity, onRemove, canRemove } = props;
  const { configuration } = useSlotContext();
  const { isModified } = useEntityDetails(entity);

  return (
    <InlineLine key={entity.id} onClick={chooseEntity} $isModified={isModified}>
      <DocumentPreview entity={entity}>
        {getEntityLabel(
          entity,
          <span style={{ color: '#999' }}>No value {configuration.allowEditing ? '(click to edit)' : null}</span>
        )}
      </DocumentPreview>
    </InlineLine>
  );
};

const InlineParagraphWord: ProfileConfig['InlineField'] = props => {
  const { field, chooseField } = props;
  const { isModified } = useFieldDetails(field);

  return (
    <InlineLine key={field.id} onClick={chooseField} $isModified={isModified}>
      <InlineReadonlyValue field={field} />
    </InlineLine>
  );
};

const SingleParagraphEntity: ProfileConfig['SingleEntity'] = ({ showTitle = true }) => {
  const Slots = useSlotContext();
  const [entity] = useCurrentEntity();
  const { isModified } = useEntityDetails(entity);

  return (
    <>
      <Slots.Breadcrumbs />

      <Slots.AdjacentNavigation>
        {isModified && <ModifiedStatus />}
        <Slots.InlineSelector />
        {mapProperties(entity, ({ hasSelector, type, label, description, property, canInlineField }) => {
          return (
            <Slots.InlineProperties
              hasSelector={hasSelector}
              type={type}
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

export const slotConfig: ProfileConfig = {
  InlineEntity: InlineParagraphEntity,
  SingleEntity: SingleParagraphEntity,
  InlineField: InlineParagraphWord,
};
