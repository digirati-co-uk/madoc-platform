import { RoundedCard } from '@capture-models/editor';
import React from 'react';
import { InputAsCard } from '../../../form/Input';
import { getEntityLabel } from '../../utility/get-entity-label';
import { ModifiedStatus } from '../features/ModifiedStatus';
import { useEntityDetails } from '../hooks/use-entity-details';
import { EditorRenderingConfig, useProfileOverride, useSlotContext } from './EditorSlots';
import { DocumentPreview } from '../../DocumentPreview';

export const DefaultInlineEntity: EditorRenderingConfig['InlineEntity'] = props => {
  const { entity, chooseEntity, onRemove, canRemove } = props;
  const { configuration } = useSlotContext();
  const { isModified } = useEntityDetails(entity);
  const ProfileSpecificComponent = useProfileOverride('InlineEntity');

  if (ProfileSpecificComponent) {
    return <ProfileSpecificComponent {...props} />;
  }

  if (canRemove && onRemove) {
    return (
      <RoundedCard
        size="small"
        key={entity.id}
        interactive={true}
        onClick={chooseEntity}
        onRemove={canRemove ? onRemove : undefined}
      >
        {isModified && <ModifiedStatus />}
        <DocumentPreview entity={entity}>
          {getEntityLabel(
            entity,
            <span style={{ color: '#999' }}>No value {configuration.allowEditing ? '(click to edit)' : null}</span>
          )}
        </DocumentPreview>
      </RoundedCard>
    );
  }

  return (
    <InputAsCard key={entity.id} onClick={chooseEntity}>
      {isModified && <ModifiedStatus />}
      <DocumentPreview entity={entity}>
        {getEntityLabel(
          entity,
          <span style={{ color: '#999' }}>No value {configuration.allowEditing ? '(click to edit)' : null}</span>
        )}
      </DocumentPreview>
    </InputAsCard>
  );
};
