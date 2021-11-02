import { StyledFormMultilineInputElement } from '@capture-models/editor';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import styled from 'styled-components';
import { Button } from '../../../shared/navigation/Button';
import { InputContainer, InputLabel } from '../../../shared/form/Input';
import { LockIcon } from '../../../shared/icons/LockIcon';
import { useApi } from '../../../shared/hooks/use-api';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { useUser } from '../../../shared/hooks/use-site';
import { useSiteConfiguration } from '../../features/SiteConfigurationContext';
import { useRouteContext } from '../use-route-context';
import { CanvasMenuHook } from './types';

const NoteContainer = styled.div`
  padding: 0.5em;
`;

export function usePersonalNotesMenu(): CanvasMenuHook {
  const { canvasId, projectId } = useRouteContext();
  const { t } = useTranslation();
  const user = useUser();
  const config = useSiteConfiguration();
  const [newNote, setNewNote] = useState('');
  const api = useApi();

  const enabled = config.project.allowPersonalNotes || false;

  const { data, refetch } = apiHooks.getPersonalNote(() =>
    canvasId && projectId && user ? [projectId, canvasId] : undefined
  );

  const [saveNote, saveNoteStatus] = useMutation(async (newNoteValue: string) => {
    if (projectId && canvasId) {
      await api.updatePersonalNote(projectId, canvasId, newNoteValue);
      await refetch();
    }
  });

  useEffect(() => {
    if (data) {
      setNewNote(data.note);
    }
  }, [data]);

  const content = (
    <>
      {data ? (
        <NoteContainer>
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
          <Button
            $primary
            disabled={saveNoteStatus.isLoading || newNote === data.note}
            onClick={() => saveNote(newNote)}
          >
            {newNote === data.note ? t('Saved') : t('Save')}
          </Button>
        </NoteContainer>
      ) : null}
    </>
  );

  return {
    id: 'personal-notes',
    label: t('Personal notes'),
    icon: <LockIcon />,
    isLoaded: !!data,
    notifications: data && data.note ? 1 : undefined,
    isHidden: !(user && enabled),
    content,
  };
}
