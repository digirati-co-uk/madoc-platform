import { DocumentPreview, RoundedCard } from '@capture-models/editor';
import { getLabel } from '@capture-models/helpers';
import React from 'react';
import { EditorRenderingConfig } from './EditorSlots';

export const DefaultInlineEntity: EditorRenderingConfig['InlineEntity'] = ({
  entity,
  chooseEntity,
  onRemove,
  canRemove,
}) => {
  return (
    <RoundedCard
      size="small"
      key={entity.id}
      interactive={true}
      onClick={chooseEntity}
      onRemove={canRemove ? onRemove : undefined}
    >
      <DocumentPreview entity={entity}>{getLabel(entity)}</DocumentPreview>
    </RoundedCard>
  );
};
