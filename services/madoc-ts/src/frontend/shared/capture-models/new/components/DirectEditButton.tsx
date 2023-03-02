import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useCanvasModel } from '../../../../site/hooks/use-canvas-model';
import { useRouteContext } from '../../../../site/hooks/use-route-context';
import { useBrowserLayoutEffect } from '../../../hooks/use-browser-layout-effect';
import { Button, ButtonRow } from '../../../navigation/Button';
import { useApi } from '../../../hooks/use-api';
import { useLoadedCaptureModel } from '../../../hooks/use-loaded-capture-model';
import { Revisions } from '../../editor/stores/revisions/index';
import { useDeselectRevision } from '../hooks/use-deselect-revision';
import { mergeDocument } from '../utility/merge-document';
import { EditorRenderingConfig, useSlotConfiguration } from './EditorSlots';

export const DirectEditButton: EditorRenderingConfig['SubmitButton'] = ({
  saveOnNavigate = true,
  captureModel: _captureModel,
}) => {
  const { canvasId } = useRouteContext();
  const { data: projectModel } = useCanvasModel();
  const [{ captureModel }, , refetchModel] = useLoadedCaptureModel(
    _captureModel ? _captureModel.id : projectModel?.model?.id,
    _captureModel,
    canvasId
  );
  const api = useApi();
  const { t } = useTranslation();
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const config = useSlotConfiguration();
  const deselectRevision = useDeselectRevision();
  const unsavedIds = Revisions.useStoreState(s => s.unsavedRevisionIds);
  const isUnsaved = currentRevision && unsavedIds.indexOf(currentRevision.revision.id) !== -1;
  const [isUpToDate, setIsUpToDate] = useState(true);
  const latestRevision = useRef<any>();
  const isUnMounting = useRef(false);

  useEffect(() => {
    if (latestRevision.current && latestRevision.current !== currentRevision?.document) {
      setIsUpToDate(false);

      latestRevision.current = currentRevision?.document;
    }
    if (!latestRevision.current) {
      latestRevision.current = currentRevision?.document;
    }
  }, [currentRevision]);

  const [saveRevision, { isLoading, isIdle, reset }] = useMutation(async (status: string) => {
    if (!currentRevision || !captureModel || !captureModel.id) {
      if (!isUnMounting.current) {
        throw new Error(t('Unable to save your submission'));
      }
      return;
    }

    try {
      const newDocument = mergeDocument(
        captureModel.document,
        currentRevision.document,
        currentRevision.revision.deletedFields || [],
        currentRevision.revision.id
      );

      await api.updateCaptureModel(captureModel.id, {
        ...captureModel,
        document: newDocument,
      });

      if (isUnMounting.current) {
        return;
      }

      setIsUpToDate(true);

      if (config.deselectRevisionAfterSaving) {
        deselectRevision();
        reset();
        await refetchModel();
      }
    } catch (e) {
      console.error(e);
      if (!isUnMounting.current) {
        throw new Error(t('Unable to save your submission'));
      }
    }
  });

  useBrowserLayoutEffect(() => {
    const listener = () => {
      if (!isUpToDate && latestRevision.current && saveOnNavigate) {
        isUnMounting.current = true;
        saveRevision(latestRevision.current.status);
      }
    };

    window.addEventListener('popstate', listener);

    return () => {
      window.removeEventListener('popstate', listener);
    };
  }, [saveOnNavigate, isUpToDate, saveRevision]);

  if (!currentRevision) {
    return null;
  }

  if (!config.allowEditing) {
    return null;
  }

  return (
    <div style={{ padding: '0.5em 1em' }}>
      <ButtonRow $noMargin>
        {isUpToDate && isIdle ? null : (
          <Button
            $primary
            disabled={isLoading || isUpToDate}
            onClick={() => saveRevision(currentRevision.revision.status)}
          >
            {isUpToDate ? t('Saved') : isLoading ? t('Saving...') : isUnsaved ? t('Save') : t('Save changes')}
          </Button>
        )}
      </ButtonRow>
    </div>
  );
};
