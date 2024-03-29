import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useRouteContext } from '../../../../site/hooks/use-route-context';
import { Button, ButtonRow } from '../../../navigation/Button';
import { ModalButton } from '../../../components/Modal';
import { useViewerSaving } from '../../../hooks/use-viewer-saving';
import { HrefLink } from '../../../utility/href-link';
import { Revisions } from '../../editor/stores/revisions';
import { useDeselectRevision } from '../hooks/use-deselect-revision';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';
import { ErrorMessage } from '../../../callouts/ErrorMessage';

export const DefaultSubmitButton: EditorRenderingConfig['SubmitButton'] = ({ afterSave, canSubmit = true }) => {
  const { t } = useTranslation();
  const routeContext = useRouteContext();
  const Slots = useSlotContext();
  const { disableSaveForLater = false } = Slots.configuration;
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

  const [saveRevision, { isLoading, isSuccess, reset, status }] = useMutation(async (status: string) => {
    if (!currentRevision) {
      throw new Error(t('Unable to save your submission'));
    }

    try {
      // Change this to "draft" to save for later.
      await updateFunction(currentRevision, status);
    } catch (e) {
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
          openByDefault={isSuccess}
          onClose={() => {
            reset();
          }}
          footerAlignRight
          renderFooter={({ close }) => {
            return (
              <div>
                {status === 'error' && (
                  <div style={{ color: '#c74158', marginBottom: '0.5em' }}>
                    {t('Error - Unable to save your submission')}
                  </div>
                )}
                {isSuccess ? (
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
                ) : (
                  <ButtonRow $noMargin>
                    {!disableSaveForLater ? (
                      <Button
                        data-cy="save-later-button"
                        disabled={isLoading}
                        onClick={() => {
                          saveRevision('draft').then(() => {
                            deselectRevision();
                            close();
                          });
                        }}
                      >
                        {t('Save for later')}
                      </Button>
                    ) : null}
                    <Button
                      data-cy="publish-button"
                      data-testid="publish-button"
                      disabled={isLoading || !canSubmit}
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
                )}
              </div>
            );
          }}
        >
          <Button disabled={!canSubmit} $primary>
            {t('Submit')}
          </Button>
        </ModalButton>
      </ButtonRow>
    </div>
  );
};
