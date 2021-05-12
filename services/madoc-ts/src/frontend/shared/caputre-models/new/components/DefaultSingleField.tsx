import React from 'react';
import { RoundedCard } from '@capture-models/editor';
import { ModifiedStatus } from '../features/ModifiedStatus';
import { useCurrentField } from '../hooks/use-current-field';
import { useFieldDetails } from '../hooks/use-field-details';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

/**
 * Previously Verbose field. This is used when viewing a single field on a page.
 */
export const DefaultSingleField: EditorRenderingConfig['SingleField'] = () => {
  const Slots = useSlotContext();
  const [field, { property, path }] = useCurrentField();
  const { isModified } = useFieldDetails(field);

  if (!field || !property) {
    return null;
  }

  return (
    <>
      <Slots.Breadcrumbs />
      <RoundedCard size="small" interactive={false}>
        {isModified && <ModifiedStatus />}
        <Slots.FieldInstance field={field} property={property} path={path as any} />
      </RoundedCard>
    </>
  );
};
