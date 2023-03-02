import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Heading3 } from '../../shared/typography/Heading3';
import { LockIcon } from '../../shared/icons/LockIcon';

export const CanvasNotAvailableToBrowse: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ textAlign: 'center', padding: '2em', marginTop: '1em', marginBottom: '1em', background: '#eee' }}>
      <LockIcon style={{ fontSize: '3em' }} />
      <Heading3>{t('This canvas is not available to browse')}</Heading3>
    </div>
  );
};

blockEditorFor(CanvasNotAvailableToBrowse, {
  type: 'default.CanvasNotAvailableToBrowse',
  label: 'Canvas not available to browse',
  anyContext: ['canvas'],
  requiredContext: ['canvas'],
  editor: {},
});
