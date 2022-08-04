import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useRouteContext } from '../../../../site/hooks/use-route-context';
import { Button, ButtonRow } from '../../../navigation/Button';
import { useViewerSaving } from '../../../hooks/use-viewer-saving';
import { Revisions } from '../../editor/stores/revisions/index';
import { useDeselectRevision } from '../hooks/use-deselect-revision';
import { EditorRenderingConfig, useSlotConfiguration } from './EditorSlots';

export const SimpleSaveButton: EditorRenderingConfig['SubmitButton'] = ({ afterSave, saveOnNavigate }) => {
  const { t } = useTranslation();
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const context = useRouteContext();
  const updateFunction = useViewerSaving(
    afterSave
      ? async revisionRequest => {
          await afterSave({
            revisionRequest,
            context,
          });
        }
      : undefined
  );
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
    if (!currentRevision) {
      if (isUnMounting.current) {
        return;
      }
      throw new Error(t('Unable to save your submission'));
    }

    try {
      // Change this to "draft" to save for later.
      await updateFunction(currentRevision, status);

      if (isUnMounting.current) {
        return;
      }

      if (config.deselectRevisionAfterSaving) {
        deselectRevision();
        reset();
      }
    } catch (e) {
      console.error(e);
      if (isUnMounting.current) {
        return;
      }
      throw new Error(t('Unable to save your submission'));
    }
  });

  useEffect(() => {
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
  }, [saveOnNavigate, isUpToDate]);

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
