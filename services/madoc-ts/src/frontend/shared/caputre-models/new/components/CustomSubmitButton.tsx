import { Revisions } from '@capture-models/editor';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useRouteContext } from '../../../../site/hooks/use-route-context';
import { Button, ButtonRow } from '../../../navigation/Button';
import { useDeselectRevision } from '../hooks/use-deselect-revision';
import { EditorRenderingConfig, useSlotConfiguration } from './EditorSlots';

export const CustomSubmitButton: EditorRenderingConfig['SubmitButton'] = ({ afterSave, children }) => {
  const { t } = useTranslation();
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const config = useSlotConfiguration();
  const routeContext = useRouteContext();
  const deselectRevision = useDeselectRevision();
  const unsavedIds = Revisions.useStoreState(s => s.unsavedRevisionIds);
  const isUnsaved = currentRevision && unsavedIds.indexOf(currentRevision.revision.id) !== -1;

  const [saveRevision, { isLoading, reset }] = useMutation(async () => {
    if (!currentRevision) {
      throw new Error(t('Unable to save your submission'));
    }

    try {
      // Change this to "draft" to save for later.
      if (afterSave) {
        await afterSave({
          revisionRequest: currentRevision,
          context: routeContext,
        });
      }

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

  // This component requires after save.
  if (!afterSave) {
    return null;
  }

  return (
    <ButtonRow $noMargin>
      <Button $primary disabled={isLoading} onClick={() => saveRevision()}>
        {children ? children : <>{isLoading ? t('Saving...') : isUnsaved ? t('Save') : t('Save changes')}</>}
      </Button>
    </ButtonRow>
  );
};
