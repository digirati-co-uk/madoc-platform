import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Revisions } from '../../editor/stores/revisions/index';
import * as localforage from 'localforage';
import { TextButton } from '../../../navigation/Button';

export const AutosaveRevision: React.FC = () => {
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const currentDoc = currentRevision?.document.properties;
  const currentDocRef = useRef<any>();
  const { t } = useTranslation();

  const [autosaveRevision] = useMutation(async () => {
    if (!currentRevision) {
      console.log('no revision');
      return;
    }
    localforage
      .setItem(`autosave-${currentRevision.captureModelId}`, currentRevision)
      .then(value => {
        console.log(value);
      })
      .catch(err => {
        console.log(err);
        throw new Error(t('Unable to save your submission'));
      });
  });

  useEffect(() => {
    if (currentRevisionId && currentDoc) {
      currentDocRef.current = currentDoc;
    }
  }, [currentDoc, currentRevisionId]);
  return (
    <TextButton
      onClick={() => {
        autosaveRevision();
      }}
    >
      click to set revision
    </TextButton>
  );
};
export const RetreiveAutosaveRevision: React.FC = () => {
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const { t } = useTranslation();
  // importRevision
  const importRevision = Revisions.useStoreActions(a => a.importRevision);
  const selectRevision = Revisions.useStoreActions(a => a.selectRevision);
  const saveRevision = Revisions.useStoreActions(a => a.saveRevision);

  const [RetreiveSavedRevision] = useMutation(async () => {
    if (!currentRevision) {
      console.log('no revision');
      return;
    }
    localforage
      .getItem(`autosave-${currentRevision?.captureModelId}`)
      .then(value => {
        if (value) {
          console.log('got it!', value);
          // saveRevision({revisionId: value.revisionId })
          importRevision({ revisionRequest: value });
        }
        // selectRevision({ revisionId: value.revisionId });
      })
      .catch(err => {
        console.log(err);
        throw new Error(t('Unable to retreive your submission'));
      });
  });

  return (
    <TextButton
      onClick={() => {
        RetreiveSavedRevision();
      }}
    >
      click to import saved
    </TextButton>
  );
};
