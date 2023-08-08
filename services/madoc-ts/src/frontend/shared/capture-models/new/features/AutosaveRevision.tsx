import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Revisions } from '../../editor/stores/revisions/index';
import * as localforage from 'localforage';
import { TextButton } from '../../../navigation/Button';
import { isEmptyRevision } from '../../helpers/is-empty-revision';
import { InfoMessage } from '../../../callouts/InfoMessage';
import { RevisionRequest } from '../../types/revision-request';

export const AutosaveRevision: React.FC = () => {
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const currentDoc = currentRevision?.document.properties;
  const currentDocRef = useRef<any>();
  const importRevision = Revisions.useStoreActions(a => a.importRevision);
  const selectRevision = Revisions.useStoreActions(a => a.selectRevision);
  const deselectRevision = Revisions.useStoreActions(a => a.deselectRevision);

  const { t } = useTranslation();

  const [autosaveRevision] = useMutation(async () => {
    if (!currentRevision) {
      return;
    }
    const isEmpty = isEmptyRevision(currentRevision);
    if (isEmpty) {
      return;
    }
    localforage
      .setItem(`autosave-${currentRevision.captureModelId}`, currentRevision)
      .then(value => {
        console.log('saved!');
      })
      .catch(err => {
        console.log(err);
        throw new Error(t('Unable to save your submission'));
      });
  });

  const [getSavedRevision, rev] = useMutation(async () => {
    if (!currentRevision) {
      return;
    }
    return localforage
      .getItem<RevisionRequest>(`autosave-${currentRevision?.captureModelId}`)
      .then(value => {
        if (value) {
          return value;
        }
        return;
      })
      .catch(err => {
        console.log(err);
        throw new Error(t('Unable to retreive a submission'));
      });
  });

  const setRetrievedRevision = () => {
    if (currentRevisionId && rev.data) {
      deselectRevision({ revisionId: currentRevisionId });
      importRevision({ revisionRequest: rev.data });
      selectRevision({ revisionId: rev.data.revision.id });

      localforage
        .removeItem(`autosave-${currentRevision?.captureModelId}`)
        .then(() => {
          console.log('Key is cleared!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  useEffect(() => {
    if (currentRevisionId && currentDoc) {
      currentDocRef.current = currentDoc;
    }
  }, [currentDoc, currentRevisionId]);

  useEffect(() => {
    if (currentRevisionId) {
      getSavedRevision();
    }
  }, [currentRevisionId, getSavedRevision]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (currentDocRef.current && currentRevisionId) {
        currentDocRef.current = undefined;
        autosaveRevision();
      }
    }, 10000); // 10 secs

    return () => {
      clearInterval(saveInterval);
    };
  }, [autosaveRevision, currentRevisionId]);

  if (rev.data) {
    return (
      <InfoMessage>
        <TextButton
          $inherit
          onClick={() => {
            setRetrievedRevision();
          }}
        >
          {t('Continue where you left off?')}
        </TextButton>
      </InfoMessage>
    );
  }
  return null;
};
