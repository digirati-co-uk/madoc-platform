import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useApi } from '../../../hooks/use-api';
import { Revisions } from '../../editor/stores/revisions/index';

export const AutosaveRevision: React.FC<{ minutes?: number }> = ({ minutes = 2 }) => {
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const currentDoc = currentRevision?.document.properties;
  const currentDocRef = useRef<any>();
  const { t } = useTranslation();
  const api = useApi();

  const [autosaveRevision] = useMutation(async () => {
    if (!currentRevision) {
      throw new Error(t('Unable to save your submission'));
    }

    try {
      // Change this to "draft" to save for later.
      await api.updateCaptureModelRevision(currentRevision, 'draft');
    } catch (e) {
      console.error(e);
      throw new Error(t('Unable to save your submission'));
    }
  });

  useEffect(() => {
    if (currentRevisionId && currentDoc) {
      currentDocRef.current = currentDoc;
    }
  }, [currentDoc, currentRevisionId]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (currentDocRef.current && currentRevisionId) {
        currentDocRef.current = undefined;
        autosaveRevision();
      }
    }, minutes * 60 * 1000);

    return () => {
      clearInterval(saveInterval);
    };
  }, [autosaveRevision, currentRevisionId, minutes]);

  return null;
};
