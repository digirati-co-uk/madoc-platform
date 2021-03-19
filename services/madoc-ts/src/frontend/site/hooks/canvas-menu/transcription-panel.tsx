import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetadataEmptyState } from '../../../shared/atoms/MetadataConfiguration';
import { MetaDataDisplay } from '../../../shared/components/MetaDataDisplay';
import { useData } from '../../../shared/hooks/use-data';
import { InfoIcon } from '../../../shared/icons/InfoIcon';
import { TranscriptionIcon } from '../../../shared/icons/TranscriptionIcon';
import { CanvasPlaintext } from '../../features/CanvasPlaintext';
import { ManifestMetadata } from '../../features/ManifestMetadata';
import { useSiteConfiguration } from '../../features/SiteConfigurationContext';
import { CanvasLoader } from '../../pages/loaders/canvas-loader';
import { CanvasMenuHook } from './types';

export function useTranscriptionMenu(): CanvasMenuHook {
  const { data } = useData(CanvasLoader, []);
  const {
    project: { hideManifestMetadataOnCanvas = false },
  } = useSiteConfiguration();
  const { t } = useTranslation();
  const plaintext = data?.plaintext;

  const content = (
    <>
      {plaintext ? (
        <CanvasPlaintext />
      ) : (
        <MetadataEmptyState style={{ marginTop: 100 }}>No plaintext</MetadataEmptyState>
      )}
    </>
  );

  return {
    id: 'transcription',
    label: t('Transcription'),
    icon: <TranscriptionIcon />,
    isLoaded: !!data,
    content,
  };
}
