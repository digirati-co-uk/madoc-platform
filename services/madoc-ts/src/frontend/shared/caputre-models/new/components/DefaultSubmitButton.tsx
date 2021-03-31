import { Revisions, useNavigation } from '@capture-models/editor';
import { RevisionRequest } from '@capture-models/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Button, ButtonRow } from '../../../atoms/Button';
import { ModalButton } from '../../../components/Modal';
import { useViewerSaving } from '../../../hooks/use-viewer-saving';
import { EditorSlots } from './EditorSlots';

export const DefaultSubmitButton: React.FC<{ afterSave?: (req: RevisionRequest) => void }> = ({ afterSave }) => {
  const { t } = useTranslation();
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const deselectRevision = Revisions.useStoreActions(a => a.deselectRevision);
  const updateFunction = useViewerSaving(afterSave);
  const [, { pop }] = useNavigation();

  const [saveRevision, { isLoading, isSuccess, reset }] = useMutation(async (status: string) => {
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
    <div style={{ textAlign: 'right' }}>
      <ButtonRow>
        <ModalButton
          autoHeight
          modalSize={isSuccess ? 'sm' : 'lg'}
          title={t('Submit for review')}
          render={() => {
            return isSuccess ? <EditorSlots.PostSubmission /> : <EditorSlots.PreviewSubmission />;
          }}
          onClose={() => {
            if (currentRevision) {
              if (isSuccess) {
                // Deselect revision.
                deselectRevision({ revisionId: currentRevision.revision.id });
                pop();
              }
              reset();
            }
          }}
          footerAlignRight
          renderFooter={({ close }) => {
            return isSuccess ? (
              <Button data-cy="close-add-another" onClick={close}>
                {t('Close and keep working')}
              </Button>
            ) : (
              <ButtonRow $noMargin>
                <Button
                  onClick={() => {
                    saveRevision('draft').then(() => {
                      close();
                    });
                  }}
                >
                  {isLoading ? t('Saving...') : t('Save for later')}
                </Button>
                <Button
                  data-cy="publish-button"
                  disabled={isLoading}
                  $primary
                  onClick={() => {
                    saveRevision('submitted');
                  }}
                >
                  {isLoading ? t('Saving...') : t('Submit')}
                </Button>
              </ButtonRow>
            );
          }}
        >
          <Button $primary>{t('Submit')}</Button>
        </ModalButton>
      </ButtonRow>
    </div>
  );
};
