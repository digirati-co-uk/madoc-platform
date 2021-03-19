import { boolean } from '@storybook/addon-knobs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetaDataDisplay } from '../../../shared/components/MetaDataDisplay';
import { useData } from '../../../shared/hooks/use-data';
import { InfoIcon } from '../../../shared/icons/InfoIcon';
import { ManifestMetadata } from '../../features/ManifestMetadata';
import { useSiteConfiguration } from '../../features/SiteConfigurationContext';
import { CanvasLoader } from '../../pages/loaders/canvas-loader';
import { CanvasMenuHook } from './types';

export function useMetadataMenu(): CanvasMenuHook {
  const { data } = useData(CanvasLoader, []);
  const {
    project: { hideManifestMetadataOnCanvas = false },
  } = useSiteConfiguration();
  const { t } = useTranslation();
  const canvas = data?.canvas;

  const content = (
    <>
      {canvas && canvas.metadata ? <MetaDataDisplay metadata={canvas.metadata} /> : null}
      {hideManifestMetadataOnCanvas ? null : <ManifestMetadata compact />}
    </>
  );

  return {
    id: 'metadata',
    label: t('Metadata'),
    icon: <InfoIcon />,
    isLoaded: !!canvas,
    content,
  };
}
