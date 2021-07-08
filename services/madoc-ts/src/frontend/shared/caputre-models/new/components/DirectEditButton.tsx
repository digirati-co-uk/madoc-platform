import { Revisions } from '@capture-models/editor';
import { RevisionRequest } from '@capture-models/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useCanvasModel } from '../../../../site/hooks/use-canvas-model';
import { useRouteContext } from '../../../../site/hooks/use-route-context';
import { Button, ButtonRow } from '../../../atoms/Button';
import { useApi } from '../../../hooks/use-api';
import { useLoadedCaptureModel } from '../../../hooks/use-loaded-capture-model';
import { useDeselectRevision } from '../hooks/use-deselect-revision';
import { mergeDocument } from '../utility/merge-document';
import { EditorRenderingConfig, useSlotConfiguration } from './EditorSlots';

export const DirectEditButton: EditorRenderingConfig['SubmitButton'] = ({ afterSave }) => {
  const { canvasId } = useRouteContext();
  const { data: projectModel } = useCanvasModel();
  const [{ captureModel }, , refetchModel] = useLoadedCaptureModel(projectModel?.model?.id, undefined, canvasId);

  const api = useApi();
  const { t } = useTranslation();
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const config = useSlotConfiguration();
  const deselectRevision = useDeselectRevision();
  const unsavedIds = Revisions.useStoreState(s => s.unsavedRevisionIds);
  const isUnsaved = currentRevision && unsavedIds.indexOf(currentRevision.revision.id) !== -1;

  const [saveRevision, { isLoading, reset }] = useMutation(async (status: string) => {
    if (!currentRevision || !captureModel || !captureModel.id) {
      throw new Error(t('Unable to save your submission'));
    }

    try {
      const newDocument = mergeDocument(
        captureModel.document,
        currentRevision.document,
        currentRevision.revision.deletedFields,
        currentRevision.revision.id
      );

      await api.updateCaptureModel(captureModel.id, {
        ...captureModel,
        document: newDocument,
      });

      if (config.deselectRevisionAfterSaving) {
        deselectRevision();
        reset();
        await refetchModel();
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
