import { FieldHeader, FieldPreview, Revisions, RoundedCard } from '@capture-models/editor';
import { useRefinement } from '@capture-models/plugin-api';
import { BaseField, FieldInstanceListRefinement } from '@capture-models/types';
import React from 'react';
import { NewFieldButtonInstance } from './NewFieldInstanceButton';

export const FieldInstanceList: React.FC<{
  fields: Array<BaseField>;
  property: string;
  chooseField: (field: { property: string; instance: BaseField }) => void;
  path: Array<[string, string]>;
  readOnly?: boolean;
  immutableEntity?: boolean;
}> = ({ fields, chooseField, property, path, readOnly, immutableEntity }) => {
  const { removeInstance } = Revisions.useStoreActions(a => ({
    removeInstance: a.removeInstance,
  }));
  const refinement = useRefinement<FieldInstanceListRefinement>('field-instance-list', { property, instance: fields }, {
    path,
    readOnly,
    immutableEntity,
  } as any);

  if (refinement) {
    return refinement.refine({ property, instance: fields }, {
      path,
      chooseField,
      readOnly,
      immutableEntity,
    } as any);
  }

  const label = fields[0] ? fields[0].label : 'Untitled';
  const pluralLabel = fields[0] ? fields[0].pluralLabel || label : label;
  const allowMultiple = fields[0] && !readOnly ? fields[0].allowMultiple : false;
  const canRemove = allowMultiple && !readOnly && fields.length > 1;

  return (
    <div>
      <FieldHeader label={fields.length > 1 ? pluralLabel : label} />
      {fields.map(field => {
        return (
          <RoundedCard
            key={field.id}
            size="small"
            interactive={true}
            onClick={() => chooseField({ instance: field, property })}
            onRemove={canRemove ? () => removeInstance({ path: [...path, [property, field.id]] }) : undefined}
          >
            <FieldPreview field={field} />
          </RoundedCard>
        );
      })}
      {allowMultiple && !immutableEntity ? (
        <NewFieldButtonInstance property={property} path={path} field={fields[0]} />
      ) : null}
    </div>
  );
};
