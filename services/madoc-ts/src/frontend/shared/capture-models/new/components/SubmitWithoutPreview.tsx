import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useRouteContext } from '../../../../site/hooks/use-route-context';
import { Button, ButtonRow } from '../../../navigation/Button';
import { useViewerSaving } from '../../../hooks/use-viewer-saving';
import { Revisions } from '../../editor/stores/revisions/index';
import { useDeselectRevision } from '../hooks/use-deselect-revision';
import { EditorRenderingConfig, useSlotContext } from './EditorSlots';

export const SubmitWithoutPreview: EditorRenderingConfig['SubmitButton'] = ({ afterSave, canSubmit = true }) => {
  const { t } = useTranslation();
  const routeContext = useRouteContext();
  const Slots = useSlotContext();
  const { disableSaveForLater = false } = Slots.configuration;
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

  const [saveRevision, { isLoading, reset }] = useMutation(async (status: string) => {
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
        {!disableSaveForLater ? (
          <Button
            data-cy="save-later-button"
            disabled={isLoading}
            onClick={() => {
              saveRevision('draft').then(() => {
                // deselectRevision();
                // No need for this.
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
              reset();
            });
          }}
        >
          {isLoading ? t('Saving...') : t('Submit')}
        </Button>
      </ButtonRow>
    </div>
  );
};
