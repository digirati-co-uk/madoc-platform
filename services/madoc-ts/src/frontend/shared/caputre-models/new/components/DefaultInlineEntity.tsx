import { DocumentPreview, RoundedCard } from '@capture-models/editor';
import React from 'react';
import { getEntityLabel } from '../../utility/get-entity-label';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

export const DefaultInlineEntity: EditorRenderingConfig['InlineEntity'] = ({
  entity,
  chooseEntity,
  onRemove,
  canRemove,
}) => {
  const { configuration } = useSlotContext();
  return (
    <RoundedCard
      size="small"
      key={entity.id}
      interactive={true}
      onClick={chooseEntity}
      onRemove={canRemove ? onRemove : undefined}
    >
      <DocumentPreview entity={entity}>
        {getEntityLabel(
          entity,
          <span style={{ color: '#999' }}>No value {configuration.allowEditing ? '(click to edit)' : null}</span>
        )}
      </DocumentPreview>
    </RoundedCard>
  );
};
