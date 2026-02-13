import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CroppedImage } from '../../../atoms/Images';
import { InputAsCard } from '../../../form/Input';
import { FieldSet } from '../../../form/FieldSet';
import { DeleteForeverIcon } from '../../../icons/DeleteForeverIcon';
import { DownArrowIcon } from '../../../icons/DownArrowIcon';
import { Grid, GridColumn } from '../../editor/atoms/Grid';
import { RoundedCard } from '../../editor/components/RoundedCard/RoundedCard';
import { Revisions } from '../../editor/stores/revisions/index';
import { useModelTranslation } from '../../hooks/use-model-translation';
import { getEntityLabel } from '../../utility/get-entity-label';
import { isEmptyFieldList } from '../../utility/is-field-list-empty';
import { VerboseSelector } from '../../VerboseSelector';
import { BaseField } from '../../types/field-types';
import { FieldHeader } from '../../editor/components/FieldHeader/FieldHeader';
import { ModifiedStatus } from '../features/ModifiedStatus';
import { useEntityDetails } from '../hooks/use-entity-details';
import { useResolvedSelector } from '../hooks/use-resolved-selector';
import { EditorRenderingConfig, useProfileOverride, useSlotContext } from './EditorSlots';
import { mapProperties } from '../utility/map-properties';
import { DocumentPreview } from '../../DocumentPreview';

const CompactHeader = styled.div<{ $collapsed: boolean }>`
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: ${props => (props.$collapsed ? 'center' : 'flex-start')};
  justify-content: space-between;
  gap: 0.5em;
  margin-bottom: ${props => (props.$collapsed ? '0.2em' : '0.5em')};
  padding-top: 0.35rem;
  padding-bottom: ${props => (props.$collapsed ? '0' : '0.4em')};
  background: #fff;
  border-bottom: ${props => (props.$collapsed ? 'none' : '1px solid #edf1fb')};
  box-shadow: ${props => (props.$collapsed ? 'none' : '0 1px 0 rgba(23, 34, 79, 0.04)')};
`;

const CompactHeaderCopy = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

const ExpandedLabel = styled.div`
  color: #34415f;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.25;
`;

const ExpandedDescription = styled.div`
  color: #6f7890;
  font-size: 0.75rem;
  line-height: 1.25;
  margin-top: 0.15em;
`;

const CollapsedLabel = styled.div`
  color: #1d2743;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CollapsedSummaryRow = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 0.55rem;
`;

const CollapsedPreviewThumb = styled.div`
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 2.25rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d8deec;
  background: #f3f6ff;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const CompactHeaderActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
`;

const CompactHeaderButton = styled.button<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #d8deec;
  background: #fff;
  color: ${props => (props.$danger ? '#7c4350' : '#3b4f97')};
  border-radius: 6px;
  padding: 0;
  line-height: 1;
  cursor: pointer;

  &:hover,
  &:focus {
    border-color: ${props => (props.$danger ? '#cc8a97' : '#4265e9')};
    color: ${props => (props.$danger ? '#963445' : '#2749ce')};
    background: ${props => (props.$danger ? '#fff2f4' : '#f4f7ff')};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(66, 101, 233, 0.2);
  }

  svg {
    width: 1.4em;
    height: 1.4em;
  }
`;

const CollapseIcon = styled(DownArrowIcon)<{ $collapsed: boolean }>`
  width: 1.05em;
  height: 1.05em;
  transform: ${props => (props.$collapsed ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const NewInstanceContainer = styled.div`
  margin-bottom: 1em;
`;

const CompactFieldItem = styled.div`
  position: relative;
  padding-top: 0.2em;
`;

const CompactFieldActions = styled(CompactHeaderActions)`
  position: absolute;
  right: 0;
  top: 0;
  z-index: 3;
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

const EmptyAddInstance = styled.button`
  width: 100%;
  min-height: 2.75rem;
  border: 1.5px dashed #cfd7ec;
  border-radius: 8px;
  background: #f8faff;
  color: #49526c;
  font-size: 0.92em;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  padding: 0.5em 0.8em;

  &:hover,
  &:focus {
    border-color: #98a7d9;
    background: #f2f6ff;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(66, 101, 233, 0.15);
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
  const [hiddenFieldIds, setHiddenFieldIds] = useState<string[]>(() => {
    if (instances.length === 1 && instances[0] && instances[0].allowMultiple && isEmptyFieldList(instances)) {
      return [instances[0].id];
    }
    return [];
  });

  const propertyList = useMemo(() => {
    const duplicates = instances.filter(i => i.revises).map(i => i.revises);
    return instances.filter(i => duplicates.indexOf(i.id) === -1);
  }, [instances]);

  if (!propertyList.length && !hiddenFieldIds.length) {
    return null;
  }

  const firstField = propertyList[0];
  if (!firstField) {
    return null;
  }
  const allowMultiple = !!firstField.allowMultiple;
  const maxMultiple = firstField.maxMultiple;
  const visibleFields = propertyList.filter(field => hiddenFieldIds.indexOf(field.id) === -1);
  const restorableIds = hiddenFieldIds.filter(id => propertyList.some(field => field.id === id));
  const canCreateAnother =
    configuration.allowEditing && allowMultiple ? (maxMultiple ? maxMultiple > propertyList.length : true) : false;
  const canAdd = restorableIds.length > 0 || canCreateAnother;
  const canRemove = configuration.allowEditing && allowMultiple;
  const showTitle = propertyList.length > 1 || !configuration.allowEditing;

  const onRemove = (field: BaseField) => {
    if (!window.confirm(t('Remove {{label}}?', { label: tModel(field.label || label) }))) {
      return;
    }

    if (visibleFields.length <= 1) {
      setHiddenFieldIds(ids => (ids.indexOf(field.id) === -1 ? [...ids, field.id] : ids));
      return;
    }

    try {
      removeInstance({ path: [...entityPath, [property, field.id]] as any });
    } catch (error) {
      console.error(error);
    }
  };

  const onAdd = () => {
    if (!configuration.allowEditing) {
      return;
    }

    if (restorableIds.length) {
      const [firstIdToRestore] = restorableIds;
      setHiddenFieldIds(ids => ids.filter(id => id !== firstIdToRestore));
      return;
    }

    if (canCreateAnother) {
      createNewFieldInstance({ property, path: entityPath as any });
    }
  };

  return (
    <>
      {showTitle ? (
        <FieldHeader
          labelFor={property}
          label={tModel(label)}
          description={description ? tModel(description) : undefined}
        />
      ) : null}
      {visibleFields.map(field => {
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
          <CompactFieldItem key={field.id} data-instance-id={field.id}>
            <CompactFieldActions>
              <CompactHeaderButton
                type="button"
                $danger
                aria-label={t('Remove {{label}}', { label: tModel(field.label || label) })}
                onClick={event => {
                  event.stopPropagation();
                  onRemove(field);
                }}
              >
                <DeleteForeverIcon />
              </CompactHeaderButton>
            </CompactFieldActions>
            {fieldInstance}
          </CompactFieldItem>
        );
      })}
      {canAdd ? (
        <NewInstanceContainer>
          {visibleFields.length ? (
            <AddNewInstance type="button" onClick={onAdd}>
              {t('Add another {{label}}', { label: tModel(label) })}
            </AddNewInstance>
          ) : (
            <EmptyAddInstance type="button" onClick={onAdd}>
              {t('+ Add {{label}}', { label: tModel(label) })}
            </EmptyAddInstance>
          )}
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
    const emptyLabel = (
      <span style={{ color: '#999' }}>No value {configuration.allowEditing ? '(click to edit)' : null}</span>
    );
    const compactSummaryLabel = getEntityLabel(entity, emptyLabel, false, tModel);
    const collapseLabel = isCollapsed ? t('Expand {{label}}', { label: tModel(entity.label) }) : t('Collapse');
    return (
      <RoundedCard
        size="small"
        key={entity.id}
        interactive={isCollapsed}
        shadow={!isCollapsed}
        onClick={isCollapsed ? () => setIsCollapsed(false) : undefined}
      >
        <CompactHeader
          $collapsed={isCollapsed}
          data-testid="compact-inline-header"
          data-has-divider={isCollapsed ? 'false' : 'true'}
        >
          <CompactHeaderCopy>
            {isCollapsed ? (
              <CollapsedSummaryRow>
                {selector && previewData[selector.id] ? (
                  <CollapsedPreviewThumb>
                    <img src={previewData[selector.id]} />
                  </CollapsedPreviewThumb>
                ) : null}
                <CollapsedLabel>{compactSummaryLabel}</CollapsedLabel>
              </CollapsedSummaryRow>
            ) : (
              <>
                <ExpandedLabel>{tModel(entity.label)}</ExpandedLabel>
                {entity.description ? <ExpandedDescription>{tModel(entity.description)}</ExpandedDescription> : null}
              </>
            )}
          </CompactHeaderCopy>
          <CompactHeaderActions>
            <CompactHeaderButton
              type="button"
              aria-expanded={!isCollapsed}
              aria-label={collapseLabel}
              onClick={event => {
                event.stopPropagation();
                setIsCollapsed(collapsed => !collapsed);
              }}
            >
              <CollapseIcon $collapsed={isCollapsed} />
            </CompactHeaderButton>
            {canRemove && onRemove ? (
              <CompactHeaderButton
                type="button"
                $danger
                aria-label={t('Remove {{label}}', { label: tModel(entity.label) })}
                onClick={event => {
                  event.stopPropagation();
                  if (!window.confirm(t('Remove {{label}}?', { label: tModel(entity.label) }))) {
                    return;
                  }
                  onRemove();
                }}
              >
                <DeleteForeverIcon />
              </CompactHeaderButton>
            ) : null}
          </CompactHeaderActions>
        </CompactHeader>
        {isCollapsed ? null : (
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
