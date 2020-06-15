import {
  BackgroundSplash,
  CardButton,
  FieldWrapper,
  Revisions,
  RoundedCard,
  useFieldSelector,
} from '@capture-models/editor';
import { useRefinement } from '@capture-models/plugin-api';
import { BaseField, FieldRefinement } from '@capture-models/types';
import React, { useState } from 'react';

export const VerboseFieldPage: React.FC<{
  field: { property: string; instance: BaseField };
  path: Array<[string, string]>;
  goBack: () => void;
  showNavigation?: boolean;
  readOnly?: boolean;
}> = ({ field, path, goBack, showNavigation, readOnly }) => {
  const [value, setValue] = useState(field.instance.value);
  const updateFieldValue = Revisions.useStoreActions(a => a.updateFieldValue);
  const selector = useFieldSelector(field.instance);
  const refinement = useRefinement<FieldRefinement>('field', field, {
    path,
  });

  if (refinement) {
    return refinement.refine(field, { path, goBack, showNavigation, readOnly });
  }

  return (
    <BackgroundSplash header={field.instance.label}>
      <RoundedCard size="small">
        <FieldWrapper field={field.instance} selector={selector} onUpdateValue={setValue} />
      </RoundedCard>
      <CardButton
        onClick={() => {
          updateFieldValue({ path, value });
          goBack();
        }}
      >
        Finish and save
      </CardButton>
    </BackgroundSplash>
  );
};
