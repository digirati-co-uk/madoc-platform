import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { Heading3 } from '../../shared/atoms/Heading3';
import { LockIcon } from '../../shared/atoms/LockIcon';
import { usePreventCanvasNavigation } from './PreventUsersNavigatingCanvases';
import { RandomlyAssignCanvas } from './RandomlyAssignCanvas';

export const ManifestNotAvailableToBrowse: React.FC = () => {
  const { t } = useTranslation();
  const { showWarning } = usePreventCanvasNavigation();

  if (!showWarning) {
    return null;
  }

  return (
    <div style={{ textAlign: 'center', padding: '2em', background: '#eee' }}>
      <LockIcon style={{ fontSize: '3em' }} />
      <Heading3>{t('This manifest is not available to browse')}</Heading3>
      <RandomlyAssignCanvas />
    </div>
  );
};

blockEditorFor(ManifestNotAvailableToBrowse, {
  type: 'default.ManifestNotAvailableToBrowse',
  label: 'Manifest not available to browse fallback',
  anyContext: ['manifest'],
  requiredContext: ['manifest'],
  editor: {},
});
