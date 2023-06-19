import * as React from 'react';
import { MetadataEmptyState } from '../../src/frontend/shared/atoms/MetadataConfiguration';
import { InputContainer, InputLabel } from '../../src/frontend/shared/form/Input';
import { StyledFormMultilineInputElement } from '../../src/frontend/shared/capture-models/editor/atoms/StyledForm';
import { Button } from '../../src';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface personalNotesType {
  enabled?: boolean;
  count: number;
}
export const PersonalNotesPanel: React.FC<{ personalNotes?: personalNotesType }> = ({ personalNotes }) => {
  const { t } = useTranslation();
  const [newNote, setNewNote] = useState('');

  if (!personalNotes || personalNotes.count < 1) {
    return <MetadataEmptyState>No Personal Notes</MetadataEmptyState>;
  }
  return (
    <>
      <div>
        <InputContainer>
          <InputLabel htmlFor="personal-notes">{t('Personal notes')}</InputLabel>
          <StyledFormMultilineInputElement
            data-cy="personal-notes"
            id="personal-notes"
            minRows={10}
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            style={{ fontSize: '0.8em' }}
          />
        </InputContainer>
        <Button $primary disabled={true}>
          {t('Save')}
        </Button>
      </div>
    </>
  );
};
