import React, { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ErrorMessage } from '../../atoms/Message';
import { TextField } from '../../input-types/TextField/TextField';
import { CardButton } from '../CardButton/CardButton';
import { CardButtonGroup } from '../CardButtonGroup/CardButtonGroup';
import { FieldHeaderWrapper, FieldHeaderTitle } from '../FieldHeader/FieldHeader';
import { RoundedCard } from '../RoundedCard/RoundedCard';
import { useTranslation } from 'react-i18next';

export const RevisionSummary: React.FC<{
  descriptionOfChange: string;
  error?: string;
  onSave?: () => void;
  onPublish?: () => void;
  onEdit?: () => void;
  setDescriptionOfChange?: (change: string) => void;
  isSaving?: boolean;
}> = ({ onSave, onPublish, onEdit, isSaving, error, descriptionOfChange, setDescriptionOfChange }) => {
  const { t } = useTranslation();
  const [label, setLabel] = useState(descriptionOfChange);

  const [updateValue] = useDebouncedCallback(v => {
    if (setDescriptionOfChange) {
      setDescriptionOfChange(v as any);
    }
  }, 200);

  useEffect(() => {
    updateValue(label);
  }, [label, setDescriptionOfChange, updateValue]);

  return (
    <>
      {error ? <ErrorMessage>{t('Something went wrong while saving your submission')}</ErrorMessage> : null}
      {setDescriptionOfChange ? (
        <RoundedCard size="medium">
          <label>
            <FieldHeaderWrapper>
              <FieldHeaderTitle htmlFor="label">{t('Short description of your contribution.')}</FieldHeaderTitle>
            </FieldHeaderWrapper>
            <TextField
              id="label"
              type="text-field"
              value={label}
              multiline={true}
              label={t('short description of your contribution')}
              updateValue={setLabel}
            />
          </label>
        </RoundedCard>
      ) : null}
      {onEdit || onSave ? (
        <CardButtonGroup>
          {onEdit ? (
            <CardButton size="small" onClick={onEdit}>
              {t('Edit')}
            </CardButton>
          ) : null}
          {onSave ? (
            <CardButton size="small" disabled={isSaving} onClick={onSave}>
              {isSaving ? t('Saving...') : t('Save changes')}
            </CardButton>
          ) : null}
        </CardButtonGroup>
      ) : null}
      {onPublish ? (
        <CardButton disabled={isSaving} size="small" onClick={onPublish}>
          {isSaving ? t('Saving...') : t('Submit for review')}
        </CardButton>
      ) : null}
    </>
  );
};
