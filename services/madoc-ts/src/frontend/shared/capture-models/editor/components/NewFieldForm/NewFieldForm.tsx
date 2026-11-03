import React, { useContext, useState } from 'react';
import { PluginContext } from '../../../plugin-api/context';
import { FieldSpecification } from '../../../types/field-types';
import { SelectorSpecification } from '../../../types/selector-types';
import { Button } from '../../atoms/Button';
import { ChooseFieldButton } from '../ChooseFieldButton/ChooseFieldButton';
import { resolveFieldType } from '../ChooseFieldButton/resolve-field-type';
import { ChooseSelectorButton } from '../ChooseSelectorButton/ChooseSelectorButton';
import { ErrorMessage } from '../../atoms/Message';
import { StyledForm, StyledFormField, StyledFormInput, StyledFormLabel } from '../../atoms/StyledForm';
import { useTranslation } from 'react-i18next';

type Props = {
  existingTerms: string[];
  onSave: (t: {
    fieldType: string;
    selectorType?: string;
    term: string;
    field: FieldSpecification;
    selector?: SelectorSpecification;
  }) => void;
};

export function NewFieldForm({ existingTerms, onSave }: Props) {
  const { t } = useTranslation();
  const [term, setTerm] = useState('');
  const { fields, selectors } = useContext(PluginContext);
  const [fieldType, setFieldType] = useState<string | undefined>();
  const selectedFieldType = resolveFieldType(
    Object.values(fields)
      .filter((field): field is FieldSpecification => !!field)
      .map(field => field.type),
    fieldType
  );
  const [selectorType, setSelectorType] = useState<keyof typeof selectors | ''>('');
  const error = existingTerms.includes(term) ? t('The key "{{term}}" already exists in this item', { term }) : '';

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFieldType || !term || error) return;
    const field = fields[selectedFieldType];
    if (!field) return;
    const selector = selectorType ? selectors[selectorType] : undefined;
    onSave({
      term,
      fieldType: selectedFieldType,
      field: field,
      selectorType,
      selector,
    });
  };

  return (
    <StyledForm onSubmit={onSubmit} autoComplete="off">
      <StyledFormField>
        <StyledFormLabel>
          {t('Choose field type')}
          <ChooseFieldButton fieldType={selectedFieldType} onChange={setFieldType} />
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          {t('Choose selector (optional)')}
          <ChooseSelectorButton onChange={type => setSelectorType(type || '')} />
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          {t('JSON Key / Term')}
          <StyledFormInput
            type="text"
            name="term"
            required={true}
            value={term}
            onChange={e => setTerm(e.currentTarget.value)}
          />
        </StyledFormLabel>
      </StyledFormField>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      <Button type="submit" disabled={!selectedFieldType || error !== '' || term === ''} primary>
        {t('Save')}
      </Button>
    </StyledForm>
  );
}
