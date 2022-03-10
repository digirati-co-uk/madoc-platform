import React from 'react';
import { BaseField } from '../../../types/field-types';
import { FieldHeader } from '../FieldHeader/FieldHeader';
import { FieldPreview } from '../FieldPreview/FieldPreview';
import { RoundedCard } from '../RoundedCard/RoundedCard';

type FieldInstanceListProps = {
  fields: Array<BaseField>;
  property: string;
  fallbackLabel?: string;
  chooseField?: (field: { property: string; instance: BaseField }) => void;
};

export const FieldInstanceList: React.FC<FieldInstanceListProps> = ({
  fields,
  property,
  chooseField,
  fallbackLabel = 'Untitled',
}) => {
  const label = fields[0] ? fields[0].label : fallbackLabel;
  const pluralLabel = fields[0] ? fields[0].pluralLabel || label : label;

  return (
    <>
      <FieldHeader label={fields.length > 1 ? pluralLabel : label} />
      {fields.map((field, idx) => {
        return (
          <RoundedCard
            key={idx}
            size="small"
            interactive={!!chooseField}
            onClick={chooseField ? () => chooseField({ instance: field, property }) : undefined}
          >
            <FieldPreview field={field} />
          </RoundedCard>
        );
      })}
    </>
  );
};
