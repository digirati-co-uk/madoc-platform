import { isEntityList } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';
import React, { useMemo } from 'react';
import { ProfileProvider, useSlotContext } from '../components/EditorSlots';
import { useCurrentEntity } from './use-current-entity';

export function useInlineProperties(
  property: string,
  { canInlineField, disableRemoving }: { canInlineField?: boolean; disableRemoving?: boolean } = {}
) {
  const Slots = useSlotContext();
  const [entity, { setSelectedField, setFocusedField, path }] = useCurrentEntity();
  const propertyList = useMemo(() => {
    const instance: any[] = entity.properties[property] || [];

    const duplicates = instance.filter(i => i.revises).map(i => i.revises);

    return instance.filter(i => duplicates.indexOf(i.id) === -1);
  }, [entity.properties, property]);
  const canRemove = Boolean(!disableRemoving && propertyList[0].allowMultiple && propertyList.length > 1);
  const type = isEntityList(propertyList) ? 'entity' : 'field';

  const renderEntityList = () => {
    const documents = propertyList as Array<CaptureModel['document']>;

    return documents.map((doc, n) => (
      <ProfileProvider key={n} profile={doc.profile || entity.profile}>
        <Slots.InlineEntity
          entity={doc}
          property={property}
          canRemove={canRemove}
          onRemove={() => {
            // @todo remove instance from list.
          }}
          chooseEntity={() => {
            setSelectedField({ property: property, id: doc.id });
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

  const render = type === 'entity' ? renderEntityList : canInlineField ? renderInlineFields : renderFieldList;

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
