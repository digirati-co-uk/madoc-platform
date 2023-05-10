import { BaseField, FieldComponent } from '../../../types/field-types';
import { InternationalString } from '@iiif/presentation-3';
import React from 'react';
import { MetadataEditor } from '../../../../../admin/molecules/MetadataEditor';
import { useDefaultLocale, useSupportedLocales } from '../../../../hooks/use-site';

export interface InternationalFieldProps extends BaseField {
  id: string;
  type: 'international-field';
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  previewInline?: boolean;
  minLines?: number;
  value: InternationalString;
  disabled?: boolean;
}

export const InternationalField: FieldComponent<InternationalFieldProps> = ({
  value,
  id,
  label,
  updateValue,
  disabled,
}) => {
  const defaultLocale = useDefaultLocale();
  const supportedLocales = useSupportedLocales();

  return (
    <div style={{ fontSize: '1.23em' }}>
      <MetadataEditor
        metadataKey={label}
        id={id}
        disabled={disabled}
        fluid={true}
        availableLanguages={supportedLocales}
        fields={typeof value === 'string' ? { none: [value] } : value}
        onSave={data => updateValue(data.toInternationalString())}
        defaultLocale={defaultLocale}
      />
    </div>
  );
};
