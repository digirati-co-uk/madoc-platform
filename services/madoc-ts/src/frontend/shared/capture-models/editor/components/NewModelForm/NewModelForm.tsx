import React, { useState } from 'react';
import { createModel } from '../../../helpers/create-model';
import { StructureType } from '../../../types/utility';
import { Button } from '../../atoms/Button';
import { StyledForm, StyledFormField, StyledFormInput } from '../../atoms/StyledForm';
import { useTranslation } from 'react-i18next';

type Props = {
  onSave: (choice: StructureType<'model'>) => void;
};

export const NewModelForm: React.FC<Props> = ({ onSave }) => {
  const { t } = useTranslation();
  const [label, setLabel] = useState('');

  const onSubmit = (e: any) => {
    e.preventDefault();
    if (!label) return;
    onSave(
      createModel({
        label,
      })
    );
  };

  return (
    <StyledForm onSubmit={onSubmit} autoComplete="off">
      <StyledFormField>
        <label>
          {t('Label')}
          <StyledFormInput
            type="text"
            name="term"
            required={true}
            value={label}
            autoFocus
            onChange={e => setLabel(e.currentTarget.value)}
          />
        </label>
      </StyledFormField>
      <Button disabled={label === ''} primary>
        {t('Save')}
      </Button>
    </StyledForm>
  );
};
