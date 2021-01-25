import { FieldInstance, RoundedCard } from '@capture-models/editor';
import React from 'react';
import { useCurrentField } from '../hooks/use-current-field';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

/**
 * Previously Verbose field. This is used when viewing a single field on a page.
 */
export const DefaultSingleField: EditorRenderingConfig['SingleField'] = () => {
  const Slots = useSlotContext();
  const [field, { property, path }] = useCurrentField();

  if (!field || !property) {
    return null;
  }

  return (
    <>
      <Slots.Breadcrumbs />
      <RoundedCard size="small" interactive={false}>
        <FieldInstance field={field} property={property} path={path as any} />
      </RoundedCard>
    </>
  );
};
