import { CardButton, CardButtonGroup, RoundedCard } from '@capture-models/editor';
import { CaptureModel } from '@capture-models/types';
import React, { useEffect, useState } from 'react';
import { VerboseEntityPage } from './VerboseEntityPage';
import { useDebouncedCallback } from 'use-debounce';

export const RevisionPreview: React.FC<{
  descriptionOfChange: string;
  error?: string;
  onSave?: () => void;
  onPublish?: () => void;
  onEdit?: () => void;
  setDescriptionOfChange?: (change: string) => void;
  isSaving?: boolean;
}> = ({ onSave, onPublish, onEdit, isSaving, error, descriptionOfChange, setDescriptionOfChange }) => {
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
    <VerboseEntityPage title="Summary of your submission" readOnly={true}>
      {error ? (
        <div>
          <p>Something went wrong while saving your submission</p>
        </div>
      ) : null}
      {setDescriptionOfChange ? (
        <RoundedCard>
          <form>
            <label>
              Short description of your contribution.
              <textarea name="label" required={true} value={label} onChange={e => setLabel(e.target.value)} />
            </label>
          </form>
        </RoundedCard>
      ) : null}
      {onEdit || onSave ? (
        <CardButtonGroup>
          {onEdit ? <CardButton onClick={onEdit}>Edit</CardButton> : null}
          {onSave ? (
            <CardButton disabled={isSaving} onClick={onSave}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </CardButton>
          ) : null}
        </CardButtonGroup>
      ) : null}
      {onPublish ? (
        <CardButton disabled={isSaving} size="large" onClick={onPublish}>
          {isSaving ? 'Saving...' : 'Submit for review'}
        </CardButton>
      ) : null}
    </VerboseEntityPage>
  );
};
