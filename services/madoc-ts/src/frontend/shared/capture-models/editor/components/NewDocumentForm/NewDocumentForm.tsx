import React, { useContext, useEffect, useState } from 'react';
import { PluginContext } from '../../../plugin-api/context';
import { SelectorSpecification } from '../../../types/selector-types';
import { Button } from '../../atoms/Button';
import { ChooseSelectorButton } from '../ChooseSelectorButton/ChooseSelectorButton';
import { ErrorMessage } from '../../atoms/Message';
import { StyledForm, StyledFormField, StyledFormInput } from '../../atoms/StyledForm';
import { useTranslation } from 'react-i18next';

type Props = {
  existingTerms: string[];
  onSave: (t: { term: string; selectorType?: string; selector?: SelectorSpecification }) => void;
};

export const NewDocumentForm: React.FC<Props> = ({ existingTerms, onSave }) => {
  const { t } = useTranslation();
  const [term, setTerm] = useState('');
  const [error, setError] = useState('');
  const { selectors } = useContext(PluginContext);
  const [selectorType, setSelectorType] = useState<keyof typeof selectors | ''>('');

  const onSubmit = (e: any) => {
    e.preventDefault();
    const selector = selectorType ? selectors[selectorType] : undefined;
    onSave({
      term,
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
  }, [existingTerms, t, term]);

  return (
    <StyledForm onSubmit={onSubmit} autoComplete="off">
      <StyledFormField>
        <label>
          {t('JSON Key / Term')}
          <StyledFormInput
            type="text"
            name="term"
            required={true}
            value={term}
            onChange={e => setTerm(e.currentTarget.value)}
          />
        </label>
      </StyledFormField>
      <StyledFormField>
        <label>
          {t('Choose selector (optional)')}
          <ChooseSelectorButton onChange={type => setSelectorType(type as any)} />
        </label>
      </StyledFormField>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      <Button disabled={error !== '' || term === ''} primary>
        {t('Save')}
      </Button>
    </StyledForm>
  );
};
