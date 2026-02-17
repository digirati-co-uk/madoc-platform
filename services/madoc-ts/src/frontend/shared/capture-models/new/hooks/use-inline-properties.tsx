import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { isEntityList } from '../../helpers/is-entity';
import { Revisions } from '../../editor/stores/revisions';
import { useModelTranslation } from '../../hooks/use-model-translation';
import { isEntityEmpty } from '../../utility/is-entity-empty';
import { isEmptyFieldList } from '../../utility/is-field-list-empty';
import { DeleteForeverIcon } from '../../../icons/DeleteForeverIcon';
import { CaptureModel } from '../../types/capture-model';
import { BaseField } from '../../types/field-types';
import { ProfileProvider, useSlotContext } from '../components/EditorSlots';
import { useCurrentEntity } from './use-current-entity';
import { useTwoLevelInlineMode } from './use-two-level-inline-mode';

const NewInstanceContainer = styled.div`
  margin-bottom: 1em;
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

const CompactFieldItem = styled.div`
  position: relative;
  padding-top: 0.2em;
`;

const CompactRemoveButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 6px;
  border: 1px solid #d2d9eb;
  background: #fff;
  color: #7c4350;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 3;

  &:hover,
  &:focus {
    border-color: #cc8a97;
    color: #963445;
    background: #fff2f4;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(66, 101, 233, 0.2);
  }

  svg {
    width: 1em;
    height: 1em;
  }
`;

const CompactInlineEntityList: React.FC<{
  property: string;
  documents: Array<CaptureModel['document']>;
  path: [string, string, boolean?][];
  profile?: string;
}> = ({ property, documents, path, profile }) => {
  const Slots = useSlotContext();
  const { configuration } = Slots;
  const { t } = useTranslation();
  const { t: tModel } = useModelTranslation();
  const { createNewEntityInstance, removeInstance } = Revisions.useStoreActions(a => ({
    createNewEntityInstance: a.createNewEntityInstance,
    removeInstance: a.removeInstance,
  }));
  const firstEntity = documents[0];
  const allowMultiple = !!firstEntity?.allowMultiple;
  const maxMultiple = firstEntity?.maxMultiple;
  const [hiddenEntityIds, setHiddenEntityIds] = useState<string[]>(() => {
    if (allowMultiple && documents.length === 1 && documents[0] && isEntityEmpty(documents[0])) {
      return [documents[0].id];
    }
    return [];
  });

  const visibleDocuments = useMemo(
    () => documents.filter(doc => hiddenEntityIds.indexOf(doc.id) === -1),
    [documents, hiddenEntityIds]
  );
  const restorableIds = useMemo(
    () => hiddenEntityIds.filter(id => documents.some(doc => doc.id === id)),
    [documents, hiddenEntityIds]
  );
  const canCreateAnother = configuration.allowEditing && allowMultiple
    ? maxMultiple
      ? maxMultiple > documents.length
      : true
    : false;
  const canAdd = restorableIds.length > 0 || canCreateAnother;
  const canRemove = configuration.allowEditing && allowMultiple;
  const entityLabel = firstEntity?.label || 'Item';

  if (!firstEntity) {
    return null;
  }

  const onRemove = (id: string) => {
    if (!window.confirm(t('Remove {{label}}?', { label: tModel(entityLabel) }))) {
      return;
    }

    if (visibleDocuments.length <= 1) {
      setHiddenEntityIds(ids => (ids.indexOf(id) === -1 ? [...ids, id] : ids));
      return;
    }

    try {
      removeInstance({ path: [...path, [property, id]] as any });
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
      setHiddenEntityIds(ids => ids.filter(id => id !== firstIdToRestore));
      return;
    }

    if (canCreateAnother) {
      createNewEntityInstance({ property, path: path as any });
    }
  };

  return (
    <>
      {visibleDocuments.length
        ? visibleDocuments.map(doc => (
            <ProfileProvider key={doc.id} profile={doc.profile || profile}>
              <Slots.InlineEntity
                entity={doc}
                property={property}
                path={path as any}
                inlineMode="two-level"
                canRemove={canRemove}
                onRemove={() => onRemove(doc.id)}
                chooseEntity={() => undefined}
              />
            </ProfileProvider>
          ))
        : null}
      {canAdd ? (
        <NewInstanceContainer>
          {visibleDocuments.length ? (
            <AddNewInstance type="button" onClick={onAdd}>
              {t('Add another {{label}}', { label: tModel(entityLabel) })}
            </AddNewInstance>
          ) : (
            <EmptyAddInstance type="button" onClick={onAdd}>
              {t('+ Add {{label}}', { label: tModel(entityLabel) })}
            </EmptyAddInstance>
          )}
        </NewInstanceContainer>
      ) : null}
    </>
  );
};

const CompactInlineFieldList: React.FC<{
  property: string;
  fields: Array<BaseField>;
  path: [string, string, boolean?][];
  profile?: string;
}> = ({ property, fields, path, profile }) => {
  const Slots = useSlotContext();
  const { configuration } = Slots;
  const { t } = useTranslation();
  const { t: tModel } = useModelTranslation();
  const { createNewFieldInstance, removeInstance } = Revisions.useStoreActions(a => ({
    createNewFieldInstance: a.createNewFieldInstance,
    removeInstance: a.removeInstance,
  }));
  const firstField = fields[0];
  const allowMultiple = !!firstField?.allowMultiple;
  const maxMultiple = firstField?.maxMultiple;
  const [hiddenFieldIds, setHiddenFieldIds] = useState<string[]>(() => {
    if (allowMultiple && fields.length === 1 && isEmptyFieldList(fields)) {
      return [fields[0].id];
    }
    return [];
  });

  const visibleFields = useMemo(
    () => fields.filter(field => hiddenFieldIds.indexOf(field.id) === -1),
    [fields, hiddenFieldIds]
  );
  const restorableIds = useMemo(
    () => hiddenFieldIds.filter(id => fields.some(field => field.id === id)),
    [fields, hiddenFieldIds]
  );
  const canCreateAnother = configuration.allowEditing && allowMultiple
    ? maxMultiple
      ? maxMultiple > fields.length
      : true
    : false;
  const canAdd = restorableIds.length > 0 || canCreateAnother;
  const canRemove = configuration.allowEditing && allowMultiple;
  const fieldLabel = firstField?.label || 'Item';

  if (!firstField) {
    return null;
  }

  const onRemove = (id: string) => {
    if (!window.confirm(t('Remove {{label}}?', { label: tModel(fieldLabel) }))) {
      return;
    }

    if (visibleFields.length <= 1) {
      setHiddenFieldIds(ids => (ids.indexOf(id) === -1 ? [...ids, id] : ids));
      return;
    }

    try {
      removeInstance({ path: [...path, [property, id]] as any });
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
      createNewFieldInstance({ property, path: path as any });
    }
  };

  return (
    <>
      {visibleFields.length
        ? visibleFields.map(field => (
            <ProfileProvider key={field.id} profile={field.profile || profile}>
              <CompactFieldItem>
                {canRemove ? (
                  <CompactRemoveButton
                    type="button"
                    aria-label={t('Remove {{label}}', { label: tModel(field.label || fieldLabel) })}
                    onClick={event => {
                      event.stopPropagation();
                      onRemove(field.id);
                    }}
                  >
                    <DeleteForeverIcon />
                  </CompactRemoveButton>
                ) : null}
                <Slots.FieldInstance
                  field={field}
                  property={property}
                  path={path as any}
                  hideHeader={visibleFields.length > 1}
                />
              </CompactFieldItem>
            </ProfileProvider>
          ))
        : null}
      {canAdd ? (
        <NewInstanceContainer>
          {visibleFields.length ? (
            <AddNewInstance type="button" onClick={onAdd}>
              {t('Add another {{label}}', { label: tModel(fieldLabel) })}
            </AddNewInstance>
          ) : (
            <EmptyAddInstance type="button" onClick={onAdd}>
              {t('+ Add {{label}}', { label: tModel(fieldLabel) })}
            </EmptyAddInstance>
          )}
        </NewInstanceContainer>
      ) : null}
    </>
  );
};

export function useInlineProperties(
  property: string,
  { canInlineField, disableRemoving }: { canInlineField?: boolean; disableRemoving?: boolean } = {}
) {
  const Slots = useSlotContext();
  const twoLevelInlineMode = useTwoLevelInlineMode();
  const [entity, { setSelectedField, setFocusedField, path }] = useCurrentEntity();
  const propertyList = useMemo(() => {
    const instance: any[] = entity.properties[property] || [];

    const duplicates = instance.filter(i => i.revises).map(i => i.revises);

    return instance.filter(i => duplicates.indexOf(i.id) === -1);
  }, [entity.properties, property]);
  const canRemove = Boolean(
    propertyList[0] && !disableRemoving && propertyList[0].allowMultiple && propertyList.length > 1
  );
  const type = isEntityList(propertyList) ? 'entity' : 'field';

  const renderEntityList = () => {
    const documents = propertyList as Array<CaptureModel['document']>;

    if (twoLevelInlineMode) {
      return <CompactInlineEntityList property={property} documents={documents} path={path as any} profile={entity.profile} />;
    }

    return documents.map((doc, n) => (
      <ProfileProvider key={n} profile={doc.profile || entity.profile}>
        <Slots.InlineEntity
          entity={doc}
          property={property}
          path={path as any}
          inlineMode={twoLevelInlineMode ? 'two-level' : 'default'}
          canRemove={canRemove}
          onRemove={() => {
            // @todo remove instance from list.
          }}
          chooseEntity={() => {
            if (!twoLevelInlineMode) {
              setSelectedField({ property: property, id: doc.id });
            }
          }}
        />
      </ProfileProvider>
    ));
  };

  const renderFieldList = () => {
    const fields = propertyList as Array<BaseField>;

    return fields.map((field, n) => (
      <ProfileProvider key={n} profile={field.profile || entity.profile}>
        <Slots.InlineField
          path={path as any}
          field={field}
          property={property}
          canRemove={canRemove}
          onRemove={() => {
            // @todo remove instance from list.
          }}
          chooseField={() => {
            setFocusedField({ property: property, id: field.id });
          }}
          readonly={true}
        />
      </ProfileProvider>
    ));
  };

  const renderInlineFields = () => {
    const fields = propertyList as Array<BaseField>;

    if (twoLevelInlineMode) {
      return <CompactInlineFieldList property={property} fields={fields} path={path as any} profile={entity.profile} />;
    }

    if (!Slots.configuration.allowEditing) {
      return fields.map((field, n) => (
        <ProfileProvider key={n} profile={field.profile || entity.profile}>
          <Slots.InlineField path={path as any} field={field} property={property} canRemove={false} readonly={true} />
        </ProfileProvider>
      ));
    }

    return fields.map((field, idx) => (
      <ProfileProvider key={idx} profile={field.profile || entity.profile}>
        <Slots.FieldInstance field={field} property={property} path={path as any} hideHeader={fields.length > 1} />
      </ProfileProvider>
    ));
  };

  const render =
    type === 'entity' ? renderEntityList : canInlineField || twoLevelInlineMode ? renderInlineFields : renderFieldList;

  return [
    render,
    {
      type,
      propertyList,
      showTitle: type !== 'field' || propertyList.length > 1 || !Slots.configuration.allowEditing,
      isEmpty: propertyList.length === 0,
      renderEntityList,
      renderFieldList,
      renderInlineFields,
    },
  ] as const;
}
