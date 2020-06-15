import { FieldHeader, FieldPreview, RoundedCard } from '@capture-models/editor';
import { useRefinement } from '@capture-models/plugin-api';
import { BaseField, FieldInstanceListRefinement } from '@capture-models/types';
import React from 'react';

export const FieldInstanceList: React.FC<{
  fields: Array<BaseField>;
  property: string;
  chooseField: (field: { property: string; instance: BaseField }) => void;
  path: Array<[string, string]>;
  readOnly?: boolean;
}> = ({ fields, chooseField, property, path, readOnly }) => {
  const refinement = useRefinement<FieldInstanceListRefinement>(
    'field-instance-list',
    { property, instance: fields },
    {
      path,
      readOnly,
    }
  );

  if (refinement) {
    return refinement.refine(
      { property, instance: fields },
      {
        path,
        chooseField,
        readOnly,
      }
    );
  }

  const label = fields[0] ? fields[0].label : 'Untitled';
  const pluralLabel = fields[0] ? fields[0].pluralLabel || label : label;

  return (
    <div>
      <FieldHeader label={fields.length > 1 ? pluralLabel : label} />
      {fields.map((field, idx) => {
        return (
          <RoundedCard
            key={idx}
            size="small"
            interactive={true}
            onClick={() => chooseField({ instance: field, property })}
          >
            <FieldPreview field={field} />
          </RoundedCard>
        );
      })}
    </div>
  );
};
