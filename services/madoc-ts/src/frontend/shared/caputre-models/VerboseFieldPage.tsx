import { FieldInstance, FieldInstanceReadOnly, RoundedCard } from '@capture-models/editor';
import { useRefinement } from '@capture-models/plugin-api';
import { BaseField, FieldRefinement } from '@capture-models/types';
import React from 'react';
import { RevisionActions } from './RevisionActions';
import { RevisionBreadcrumbs } from './RevisionBreadcrumbs';

export const VerboseFieldPage: React.FC<{
  field: { property: string; instance: BaseField };
  path: Array<[string, string]>;
  showNavigation?: boolean;
  readOnly?: boolean;
  allowEdits?: boolean;
  allowNavigation?: boolean;
}> = ({ field, path, showNavigation, readOnly, allowEdits, allowNavigation }) => {
  const refinement = useRefinement<FieldRefinement>('field', field, {
    path,
  });

  if (refinement) {
    return refinement.refine(field, { path, showNavigation, readOnly });
  }

  return (
    <>
      <RevisionBreadcrumbs />
      <RoundedCard size="small">
        {readOnly ? (
          <FieldInstanceReadOnly fields={[field.instance]} />
        ) : (
          <FieldInstance field={field.instance} property={field.property} path={path} />
        )}
      </RoundedCard>
      <RevisionActions allowEdits={allowEdits} allowNavigation={allowNavigation} readOnly={readOnly} />
    </>
  );
};
