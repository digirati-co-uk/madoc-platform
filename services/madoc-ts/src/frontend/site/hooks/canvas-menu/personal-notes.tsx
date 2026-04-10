import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import styledComponents from 'styled-components';
import { Button } from '../../../shared/navigation/Button';
import { InputContainer } from '../../../shared/form/Input';
import { LockIcon } from '../../../shared/icons/LockIcon';
import { useApi } from '../../../shared/hooks/use-api';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { useUser } from '../../../shared/hooks/use-site';
import { useSiteConfiguration } from '../../features/SiteConfigurationContext';
import { useRouteContext } from '../use-route-context';
import { CanvasMenuHook } from './types';
import { StyledFormTextarea } from '../../../shared/capture-models/editor/atoms/StyledForm';
import { parsePersonalNotePayload, serializePersonalNotePayload } from '../../../shared/utility/personal-note-payload';

const NoteContainer = styledComponents.div`
  padding: 1em;
`;

export function usePersonalNotesMenu(): CanvasMenuHook {
  const { canvasId, projectId } = useRouteContext();
  const { t } = useTranslation();
  const user = useUser();
  const config = useSiteConfiguration();
  const [newNote, setNewNote] = useState('');
  const api = useApi();

  const modelPageOptions = config.project.modelPageOptions as { allowPersonalNotes?: boolean } | undefined;
  const enabled = config.project.allowPersonalNotes || modelPageOptions?.allowPersonalNotes || false;

  const { data, refetch } = apiHooks.getPersonalNote(() =>
    canvasId && projectId && user ? [projectId, canvasId] : undefined
  );

  const parsedNote = useMemo(() => parsePersonalNotePayload(data?.note), [data?.note]);

  const [saveNote, saveNoteStatus] = useMutation(async (newNoteValue: string) => {
    if (projectId && canvasId) {
      const latest = await api.getPersonalNote(projectId, canvasId);
      const latestPayload = parsePersonalNotePayload(latest.note);

      await api.updatePersonalNote(
        projectId,
        canvasId,
        serializePersonalNotePayload({
          note: newNoteValue,
          tabularCellFlags: latestPayload.tabularCellFlags,
        })
      );
      await refetch();
    }
  });

  useEffect(() => {
    if (typeof data?.note === 'string') {
      setNewNote(parsedNote.note);
    }
  }, [data?.note, parsedNote.note]);

  const content = (
    <>
      {data ? (
        <NoteContainer>
          <InputContainer fluid>
            <StyledFormTextarea
              data-cy="personal-notes"
              id="personal-notes"
              rows={10}
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              style={{ fontSize: '0.8em' }}
            />
          </InputContainer>
          <Button
            $primary
            disabled={saveNoteStatus.isLoading || newNote === parsedNote.note}
            onClick={() => saveNote(newNote)}
          >
            {newNote === parsedNote.note ? t('Saved') : t('Save')}
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
    notifications: parsedNote.note ? 1 : undefined,
    isHidden: !(user && enabled),
    content,
  };
}
