import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { useLocalStorage } from '../../shared/hooks/use-local-storage';
import { useProjectStatus } from '../hooks/use-project-status';

export const CanvasModelPrepareActions: React.FC = () => {
  const { t } = useTranslation();
  const { isPreparing } = useProjectStatus();
  const [isSegmentation, setIsSegmentation] = useLocalStorage('segmentation-prepare', false);

  if (!isPreparing) {
    return null;
  }

  return (
    <ButtonRow>
      <Button $primary={isSegmentation} onClick={() => setIsSegmentation(true)}>
        {t('Segmentation mode')}
      </Button>

      <Button $primary={!isSegmentation} onClick={() => setIsSegmentation(false)}>
        {t('Prepare mode')}
      </Button>
    </ButtonRow>
  );
};

blockEditorFor(CanvasModelPrepareActions, {
  type: 'default.CanvasModelPrepareActions',
  label: 'Canvas model prepare actions',
  editor: {},
  requiredContext: ['project', 'manifest', 'canvas'],
  anyContext: ['canvas'],
});
