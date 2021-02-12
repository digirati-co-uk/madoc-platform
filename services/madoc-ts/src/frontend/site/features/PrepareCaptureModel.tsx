import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoMessage } from '../../shared/atoms/InfoMessage';
import { Spinner } from '../../shared/icons/Spinner';
import { usePreparedCanvasModel } from '../hooks/use-prepared-canvas-model';

/**
 * Prepare Capture Model
 *
 * This will check if the current canvas and project requires preparation. If the config allows,
 * it will automatically prepare the model. Otherwise it will show a prompt for the user to manually click
 * and prepare.
 *
 * If the user is assigned this task, it will always be auto-prepared.
 */
export const PrepareCaptureModel: React.FC = () => {
  const { isPreparing } = usePreparedCanvasModel();
  const { t } = useTranslation();

  if (isPreparing) {
    return (
      <InfoMessage>
        <Spinner style={{ marginRight: 10 }} /> {t('Preparing this image')}
      </InfoMessage>
    );
  }

  return null;
};
