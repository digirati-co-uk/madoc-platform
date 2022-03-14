import React from 'react';
import { FieldInstanceReadOnly } from './editor/components/FieldInstanceReadOnly/FieldInstanceReadOnly';
import { RoundedCard } from './editor/components/RoundedCard/RoundedCard';
import { FieldInstance } from './editor/connected-components/FieldInstance';
import { useRefinement } from './plugin-api/hooks/use-refinement';
import { RevisionActions } from './RevisionActions';
import { RevisionBreadcrumbs } from './RevisionBreadcrumbs';
import { BaseField } from './types/field-types';
import { FieldRefinement } from './types/refinements';

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
