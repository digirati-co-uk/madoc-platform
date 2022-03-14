import React, { useContext, useEffect, useState } from 'react';
import { PluginContext } from '../../../plugin-api/context';
import { FieldSpecification } from '../../../types/field-types';
import { SelectorSpecification } from '../../../types/selector-types';
import { Button } from '../../atoms/Button';
import { ChooseFieldButton } from '../ChooseFieldButton/ChooseFieldButton';
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

export const NewFieldForm: React.FC<Props> = ({ existingTerms, onSave }) => {
  const { t } = useTranslation();
  const [term, setTerm] = useState('');
  const { fields, selectors } = useContext(PluginContext);
  const [fieldType, setFieldType] = useState<string>('');
  const [selectorType, setSelectorType] = useState<keyof typeof selectors | ''>('');
  const [error, setError] = useState('');

  const onSubmit = (e: any) => {
    e.preventDefault();
    if (fieldType === '') return;
    const field = fields[fieldType];
    if (!field) return;
    const selector = selectorType ? selectors[selectorType] : undefined;
    onSave({
      term,
      fieldType,
      field: field,
      selectorType,
      selector,
    });
  };

  useEffect(() => {
    if (existingTerms.indexOf(term) !== -1) {
      setError(t('The key "{{term}}" already exists in this item', { term }));
    } else {
      setError('');
    }
  }, [existingTerms, term]);

  return (
    <StyledForm onSubmit={onSubmit} autoComplete="off">
      <StyledFormField>
        <StyledFormLabel>
          {t('Choose field type')}
          <ChooseFieldButton onChange={type => setFieldType(type as any)} />
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          {t('Choose selector (optional)')}
          <ChooseSelectorButton onChange={type => setSelectorType(type as any)} />
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
      <Button disabled={error !== '' || term === ''} primary>
        {t('Save')}
      </Button>
    </StyledForm>
  );
};
