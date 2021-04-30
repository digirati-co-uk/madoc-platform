import { Revisions } from '@capture-models/editor';
import { RevisionRequest } from '@capture-models/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Button, ButtonRow } from '../../../atoms/Button';
import { useViewerSaving } from '../../../hooks/use-viewer-saving';
import { useDeselectRevision } from '../hooks/use-deselect-revision';
import { useSlotConfiguration } from './EditorSlots';

export const SimpleSaveButton: React.FC<{ afterSave?: (req: RevisionRequest) => void }> = ({ afterSave }) => {
  const { t } = useTranslation();
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const updateFunction = useViewerSaving(afterSave);
  const config = useSlotConfiguration();
  const deselectRevision = useDeselectRevision();
  const unsavedIds = Revisions.useStoreState(s => s.unsavedRevisionIds);
  const isUnsaved = currentRevision && unsavedIds.indexOf(currentRevision.revision.id) !== -1;

  const [saveRevision, { isLoading, reset }] = useMutation(async (status: string) => {
    if (!currentRevision) {
      throw new Error(t('Unable to save your submission'));
    }

    try {
      // Change this to "draft" to save for later.
      await updateFunction(currentRevision, status);

      if (config.deselectRevisionAfterSaving) {
        deselectRevision();
        reset();
      }
    } catch (e) {
      console.error(e);
      throw new Error(t('Unable to save your submission'));
    }
  });

  if (!currentRevision) {
    return null;
  }

  if (!config.allowEditing) {
    return null;
  }

  return (
    <div style={{ padding: '0.5em 1em' }}>
      <ButtonRow $noMargin>
        <Button $primary disabled={isLoading} onClick={() => saveRevision(currentRevision.revision.status)}>
          {isLoading ? t('Saving...') : isUnsaved ? t('Save') : t('Save changes')}
        </Button>
      </ButtonRow>
    </div>
  );
};
