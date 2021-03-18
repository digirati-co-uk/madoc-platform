import { Revisions } from '@capture-models/editor';
import { RevisionRequest } from '@capture-models/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Button, ButtonRow } from '../../../atoms/Button';
import { useViewerSaving } from '../../../hooks/use-viewer-saving';

export const SimpleSaveButton: React.FC<{ afterSave?: (req: RevisionRequest) => void }> = ({ afterSave }) => {
  const { t } = useTranslation();
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const updateFunction = useViewerSaving(afterSave);

  const [saveRevision, { isLoading }] = useMutation(async (status: string) => {
    if (!currentRevision) {
      throw new Error(t('Unable to save your submission'));
    }

    try {
      // Change this to "draft" to save for later.
      await updateFunction(currentRevision, status);
    } catch (e) {
      console.error(e);
      throw new Error(t('Unable to save your submission'));
    }
  });

  if (!currentRevision) {
    return null;
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <ButtonRow $noMargin>
        <Button $primary disabled={isLoading} onClick={() => saveRevision('submitted')}>
          {isLoading ? t('Saving...') : t('Save')}
        </Button>
      </ButtonRow>
    </div>
  );
};
