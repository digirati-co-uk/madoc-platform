import React from 'react';
import { CroppedImage } from '../../../atoms/Images';
import { InputAsCard } from '../../../form/Input';
import { Grid, GridColumn } from '../../editor/atoms/Grid';
import { RoundedCard } from '../../editor/components/RoundedCard/RoundedCard';
import { Revisions } from '../../editor/stores/revisions/index';
import { SelectorPreview } from '../../inspector/ViewDocument';
import { getEntityLabel } from '../../utility/get-entity-label';
import { ModifiedStatus } from '../features/ModifiedStatus';
import { useEntityDetails } from '../hooks/use-entity-details';
import { useResolvedSelector } from '../hooks/use-resolved-selector';
import { EditorRenderingConfig, useProfileOverride, useSlotContext } from './EditorSlots';
import { DocumentPreview } from '../../DocumentPreview';

export const DefaultInlineEntity: EditorRenderingConfig['InlineEntity'] = props => {
  const { entity, chooseEntity, onRemove, canRemove } = props;
  const { configuration } = useSlotContext();
  const { isModified } = useEntityDetails(entity);
  const previewData = Revisions.useStoreState(s => s.selector.selectorPreviewData);
  const [selector] = useResolvedSelector(entity);
  const ProfileSpecificComponent = useProfileOverride('InlineEntity');

  if (ProfileSpecificComponent) {
    return <ProfileSpecificComponent {...props} />;
  }

  const documentPreview = (
    <>
      {isModified && <ModifiedStatus />}
      <DocumentPreview
        entity={entity}
        wrapper={element => (
          <Grid style={{ padding: '0 .5em' }}>
            {selector && previewData[selector.id] ? (
              <CroppedImage $size="tiny" style={{ marginRight: '1em' }}>
                <img src={previewData[selector.id]} />
              </CroppedImage>
            ) : null}
            <GridColumn center fluid padded={false}>
              {element}
            </GridColumn>
          </Grid>
        )}
      >
        {getEntityLabel(
          entity,
          <span style={{ color: '#999' }}>No value {configuration.allowEditing ? '(click to edit)' : null}</span>
        )}
      </DocumentPreview>
    </>
  );

  if (canRemove && onRemove) {
    return (
      <RoundedCard
        size="small"
        key={entity.id}
        interactive={true}
        onClick={chooseEntity}
        onRemove={canRemove ? onRemove : undefined}
      >
        {documentPreview}
      </RoundedCard>
    );
  }

  return (
    <InputAsCard key={entity.id} onClick={chooseEntity}>
      {documentPreview}
    </InputAsCard>
  );
};
