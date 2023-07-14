import React from 'react';
import { useTranslation } from 'react-i18next';
import { TranscriptionIcon } from '../../../shared/icons/TranscriptionIcon';
import { IIIFExplorer } from '../../../shared/viewers/iiif-explorer';
import { CanvasMenuHook } from './types';

export function useBrowserPanel(): CanvasMenuHook {
  const { t } = useTranslation();

  const content = (
    <>
      <IIIFExplorer window={false} hideHeader allowRemoveEntry />
    </>
  );

  return {
    id: 'split-view',
    label: t('Split view'),
    icon: <TranscriptionIcon />,
    isLoaded: true,
    notifications: 0,
    content,
  };
}
