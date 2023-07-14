import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetadataEmptyState } from '../../../shared/atoms/MetadataConfiguration';
import { useData } from '../../../shared/hooks/use-data';
import { TranscriptionIcon } from '../../../shared/icons/TranscriptionIcon';
import { CanvasPlaintext } from '../../features/CanvasPlaintext';
import { CanvasLoader } from '../../pages/loaders/canvas-loader';
import { CanvasMenuHook } from './types';
import { IIIFExplorer } from '@manifest-editor/iiif-browser-bundle';
import '@manifest-editor/iiif-browser-bundle/dist-umd/style.css';

export function useTranscriptionMenu(): CanvasMenuHook {
  const { data } = useData(CanvasLoader, []);
  const { t } = useTranslation();
  const plaintext = data?.plaintext;

  const content = (
    <>
      {plaintext ? (
        <CanvasPlaintext />
      ) : (
        <MetadataEmptyState style={{ marginTop: 100 }}>No plaintext</MetadataEmptyState>
      )}

      <IIIFExplorer />
    </>
  );

  return {
    id: 'transcription',
    label: t('Transcription'),
    icon: <TranscriptionIcon />,
    isLoaded: !!data,
    notifications: plaintext ? 1 : 0,
    content,
  };
}
