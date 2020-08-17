import { CardButton, FieldInstance, FieldInstanceReadOnly, RoundedCard } from '@capture-models/editor';
import { useRefinement } from '@capture-models/plugin-api';
import { BaseField, FieldRefinement } from '@capture-models/types';
import React from 'react';
import { RevisionBreadcrumbs } from './RevisionBreadcrumbs';

export const VerboseFieldPage: React.FC<{
  field: { property: string; instance: BaseField };
  path: Array<[string, string]>;
  goBack: () => void;
  showNavigation?: boolean;
  readOnly?: boolean;
}> = ({ field, path, goBack, showNavigation, readOnly }) => {
  const refinement = useRefinement<FieldRefinement>('field', field, {
    path,
  });

  if (refinement) {
    return refinement.refine(field, { path, goBack, showNavigation, readOnly });
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
      <CardButton onClick={goBack}>{readOnly ? 'Go back' : 'Finish and save'}</CardButton>
    </>
  );
};
