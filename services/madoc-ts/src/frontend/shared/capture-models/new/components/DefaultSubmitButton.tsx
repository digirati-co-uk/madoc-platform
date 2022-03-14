import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useRouteContext } from '../../../../site/hooks/use-route-context';
import { Button, ButtonRow } from '../../../navigation/Button';
import { ModalButton } from '../../../components/Modal';
import { useViewerSaving } from '../../../hooks/use-viewer-saving';
import { HrefLink } from '../../../utility/href-link';
import { Revisions } from '../../editor/stores/revisions/index';
import { useDeselectRevision } from '../hooks/use-deselect-revision';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

export const DefaultSubmitButton: EditorRenderingConfig['SubmitButton'] = ({ afterSave }) => {
  const { t } = useTranslation();
  const routeContext = useRouteContext();
  const Slots = useSlotContext();
  const { projectId } = routeContext;
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const updateFunction = useViewerSaving(
    afterSave
      ? async revisionRequest => {
          await afterSave({
            revisionRequest,
            context: routeContext,
          });
        }
      : undefined
  );
  const deselectRevision = useDeselectRevision();

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
    <div style={{ padding: '0.5em 1em' }}>
      <ButtonRow>
        <ModalButton
          autoHeight
          modalSize={isSuccess ? 'sm' : 'lg'}
          title={t('Submit for review')}
          render={() => {
            return isSuccess ? <Slots.PostSubmission /> : <Slots.PreviewSubmission />;
          }}
          onClose={() => {
            reset();
          }}
          footerAlignRight
          renderFooter={({ close }) => {
            return isSuccess ? (
              <>
                <ButtonRow $noMargin>
                  {projectId ? (
                    <Button data-cy="back-to-project" as={HrefLink} href={`/projects/${projectId}`}>
                      {t('Back to project')}
                    </Button>
                  ) : null}
                  <Button data-cy="close-add-another" onClick={close}>
                    {t('Close and keep working')}
                  </Button>
                </ButtonRow>
              </>
            ) : (
              <ButtonRow $noMargin>
                <Button
                  data-cy="save-later-button"
                  onClick={() => {
                    saveRevision('draft').then(() => {
                      deselectRevision();
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
                    saveRevision('submitted').then(() => {
                      deselectRevision();
                    });
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
