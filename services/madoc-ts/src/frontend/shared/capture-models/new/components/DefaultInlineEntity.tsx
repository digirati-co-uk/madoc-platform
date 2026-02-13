import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CroppedImage } from '../../../atoms/Images';
import { InputAsCard } from '../../../form/Input';
import { FieldSet } from '../../../form/FieldSet';
import { CloseIcon } from '../../../icons/CloseIcon';
import { DownArrowIcon } from '../../../icons/DownArrowIcon';
import { Grid, GridColumn } from '../../editor/atoms/Grid';
import { RoundedCard } from '../../editor/components/RoundedCard/RoundedCard';
import { Revisions } from '../../editor/stores/revisions/index';
import { useModelTranslation } from '../../hooks/use-model-translation';
import { getEntityLabel } from '../../utility/get-entity-label';
import { VerboseSelector } from '../../VerboseSelector';
import { BaseField } from '../../types/field-types';
import { FieldHeader } from '../../editor/components/FieldHeader/FieldHeader';
import { ModifiedStatus } from '../features/ModifiedStatus';
import { useEntityDetails } from '../hooks/use-entity-details';
import { useResolvedSelector } from '../hooks/use-resolved-selector';
import { EditorRenderingConfig, useProfileOverride, useSlotContext } from './EditorSlots';
import { mapProperties } from '../utility/map-properties';
import { DocumentPreview } from '../../DocumentPreview';

const CardControls = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.25em;
`;

const CollapseButton = styled.button`
  display: inline-flex;
  align-items: center;
  border: 1px solid #d8deec;
  background: #fff;
  color: #3b4f97;
  border-radius: 4px;
  padding: 0.2em 0.5em;
  font-size: 0.85em;
  cursor: pointer;

  &:hover,
  &:focus {
    border-color: #4265e9;
    color: #2749ce;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(66, 101, 233, 0.2);
  }
`;

const CollapsedSummary = styled.div`
  cursor: pointer;
`;

const CollapseIcon = styled(DownArrowIcon)<{ $collapsed: boolean }>`
  width: 1.1em;
  height: 1.1em;
  margin-left: 0.3em;
  transform: ${props => (props.$collapsed ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const NewInstanceContainer = styled.div`
  margin-bottom: 1em;
`;

const InstanceContainer = styled.div`
  display: flex;
  align-items: center;
`;

const InstanceComponent = styled.div`
  flex: 1 1 0px;
`;

const InstanceRemove = styled.div`
  margin-bottom: 1.3em;
  margin-left: 0.5em;
  align-self: flex-end;
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #555;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const AddNewInstance = styled.button`
  background: #e8edff;
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.9em;
  border-radius: 1.25em;
  height: 2em;
  line-height: calc(2em - 4px);
  padding: 0 1em;
  border: 2px solid transparent;
  vertical-align: center;
  cursor: pointer;

  &:hover,
  &:focus {
    border: 2px solid #4265e9;
  }

  &:focus {
    outline: none;
  }
`;

const TwoLevelInlineFieldProperty: React.FC<{
  property: string;
  label: string;
  description?: string;
  entityPath: [string, string][];
  instances: BaseField[];
}> = ({ property, label, description, entityPath, instances }) => {
  const { t } = useTranslation();
  const { t: tModel } = useModelTranslation();
  const Slots = useSlotContext();
  const { configuration } = Slots;
  const { createNewFieldInstance, removeInstance } = Revisions.useStoreActions(a => ({
    createNewFieldInstance: a.createNewFieldInstance,
    removeInstance: a.removeInstance,
  }));

  const propertyList = useMemo(() => {
    const duplicates = instances.filter(i => i.revises).map(i => i.revises);
    return instances.filter(i => duplicates.indexOf(i.id) === -1);
  }, [instances]);

  if (!propertyList.length) {
    return null;
  }

  const firstField = propertyList[0];
  const allowMultiple = !!firstField.allowMultiple;
  const maxMultiple = firstField.maxMultiple;
  const canAddAnother = maxMultiple ? maxMultiple > propertyList.length : true;
  const canRemove = configuration.allowEditing && allowMultiple && propertyList.length > 1;
  const canAdd = configuration.allowEditing && allowMultiple && canAddAnother;
  const showTitle = propertyList.length > 1 || !configuration.allowEditing;

  return (
    <>
      {showTitle ? (
        <FieldHeader
          labelFor={property}
          label={tModel(label)}
          description={description ? tModel(description) : undefined}
        />
      ) : null}
      {propertyList.map(field => {
        const fieldInstance = (
          <Slots.FieldInstance
            field={field}
            property={property}
            path={entityPath as any}
            hideHeader={propertyList.length > 1}
          />
        );

        if (!canRemove) {
          return <React.Fragment key={field.id}>{fieldInstance}</React.Fragment>;
        }

        return (
          <InstanceContainer key={field.id} data-instance-id={field.id}>
            <InstanceComponent>{fieldInstance}</InstanceComponent>
            <InstanceRemove>
              <RemoveButton
                type="button"
                aria-label={t('Remove {{label}}', { label: tModel(field.label || label) })}
                onClick={() => {
                  try {
                    removeInstance({ path: [...entityPath, [property, field.id]] as any });
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                <CloseIcon />
              </RemoveButton>
            </InstanceRemove>
          </InstanceContainer>
        );
      })}
      {canAdd ? (
        <NewInstanceContainer>
          <AddNewInstance
            type="button"
            onClick={() => {
              createNewFieldInstance({ property, path: entityPath as any });
            }}
          >
            {t('Add another {{label}}', { label: tModel(label) })}
          </AddNewInstance>
        </NewInstanceContainer>
      ) : null}
    </>
  );
};

export const DefaultInlineEntity: EditorRenderingConfig['InlineEntity'] = props => {
  const { t: tModel } = useModelTranslation();
  const { t } = useTranslation();
  const { entity, chooseEntity, onRemove, canRemove, property, path, inlineMode = 'default' } = props;
  const Slots = useSlotContext();
  const { configuration } = Slots;
  const { isModified } = useEntityDetails(entity);
  const previewData = Revisions.useStoreState(s => s.selector.selectorPreviewData);
  const [selector, { isBlockingForm: disableForm }] = useResolvedSelector(entity);
  const ProfileSpecificComponent = useProfileOverride('InlineEntity');
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (ProfileSpecificComponent) {
    return <ProfileSpecificComponent {...props} />;
  }

  const entityPath = useMemo(() => {
    return [...path, [property, entity.id]] as [string, string][];
  }, [entity.id, path, property]);

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
          <span style={{ color: '#999' }}>No value {configuration.allowEditing ? '(click to edit)' : null}</span>,
          false,
          tModel
        )}
      </DocumentPreview>
    </>
  );

  if (inlineMode === 'two-level') {
    const collapseLabel = isCollapsed ? t('Expand {{label}}', { label: tModel(entity.label) }) : t('Collapse');
    return (
      <RoundedCard
        size="small"
        key={entity.id}
        interactive={isCollapsed}
        onClick={isCollapsed ? () => setIsCollapsed(false) : undefined}
      >
        <CardControls>
          <CollapseButton
            type="button"
            aria-expanded={!isCollapsed}
            aria-label={collapseLabel}
            onClick={event => {
              event.stopPropagation();
              setIsCollapsed(collapsed => !collapsed);
            }}
          >
            {collapseLabel}
            <CollapseIcon $collapsed={isCollapsed} />
          </CollapseButton>
        </CardControls>
        {isCollapsed ? (
          <CollapsedSummary>{documentPreview}</CollapsedSummary>
        ) : (
          <>
            {selector ? <VerboseSelector selector={selector} readOnly={!configuration.allowEditing} isTopLevel={false} /> : null}
            <FieldSet disabled={disableForm} data-entity-id={entity.id}>
              {mapProperties(entity, ({ type, property: propertyName, instances, label, description }) => {
                if (type !== 'field') {
                  return null;
                }

                return (
                  <TwoLevelInlineFieldProperty
                    property={propertyName}
                    label={label}
                    description={description}
                    entityPath={entityPath}
                    instances={instances as BaseField[]}
                  />
                );
              })}
            </FieldSet>
          </>
        )}
      </RoundedCard>
    );
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
