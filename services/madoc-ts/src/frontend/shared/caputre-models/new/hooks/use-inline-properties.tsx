import { FieldInstance } from '@capture-models/editor';
import { isEntityList } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';
import React from 'react';
import { useSlotContext } from '../components/EditorSlots';
import { useCurrentEntity } from './use-current-entity';

export function useInlineProperties(
  property: string,
  { canInlineField, disableRemoving }: { canInlineField?: boolean; disableRemoving?: boolean } = {}
) {
  const Slots = useSlotContext();
  const [entity, { setSelectedField, setFocusedField, path }] = useCurrentEntity();
  const propertyList = entity.properties[property] || [];
  const canRemove = Boolean(!disableRemoving && propertyList[0].allowMultiple && propertyList.length > 1);
  const type = isEntityList(propertyList) ? 'entity' : 'field';

  const renderEntityList = () => {
    const documents = propertyList as Array<CaptureModel['document']>;

    return documents.map(doc => (
      <Slots.InlineEntity
        key={doc.id}
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
    ));
  };

  const renderFieldList = () => {
    const fields = propertyList as Array<BaseField>;

    return fields.map(field => (
      <Slots.InlineField
        key={field.id}
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
    ));
  };

  const renderInlineFields = () => {
    const fields = propertyList as Array<BaseField>;

    if (!Slots.configuration.allowEditing) {
      return fields.map(field => (
        <Slots.InlineField
          key={field.id}
          path={path as any}
          field={field}
          property={property}
          canRemove={false}
          readonly={true}
        />
      ));
    }

    return fields.map((field, idx) => (
      <FieldInstance
        key={field.id}
        field={field}
        property={property}
        path={[...path, [property, field.id]] as any}
        hideHeader={idx !== 0}
      />
    ));
  };

  const render = type === 'entity' ? renderEntityList : canInlineField ? renderInlineFields : renderFieldList;

  return [
    render,
    {
      type,
      propertyList,
      showTitle: type !== 'field' || !Slots.configuration.allowEditing,
      isEmpty: propertyList.length === 0,
      renderEntityList,
      renderFieldList,
      renderInlineFields,
    },
  ] as const;
}
