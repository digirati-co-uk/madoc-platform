import { DocumentPreview, RoundedCard } from '@capture-models/editor';
import React from 'react';
import { InlineProgressIcon } from '../../../atoms/ProgressIcon';
import { getEntityLabel } from '../../utility/get-entity-label';
import { useEntityDetails } from '../hooks/use-entity-details';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

export const DefaultInlineEntity: EditorRenderingConfig['InlineEntity'] = ({
  entity,
  chooseEntity,
  onRemove,
  canRemove,
}) => {
  const { configuration } = useSlotContext();
  const { isModified } = useEntityDetails(entity);
  return (
    <RoundedCard
      size="small"
      key={entity.id}
      interactive={true}
      onClick={chooseEntity}
      onRemove={canRemove ? onRemove : undefined}
    >
      {isModified && <InlineProgressIcon />}
      <DocumentPreview entity={entity}>
        {getEntityLabel(
          entity,
          <span style={{ color: '#999' }}>No value {configuration.allowEditing ? '(click to edit)' : null}</span>
        )}
      </DocumentPreview>
    </RoundedCard>
  );
};
