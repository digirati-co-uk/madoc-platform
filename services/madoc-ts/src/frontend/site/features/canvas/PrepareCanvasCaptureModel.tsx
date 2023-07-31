import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { usePreparedCanvasModel } from '../../hooks/use-prepared-canvas-model';

/**
 * Prepare Capture Model
 *
 * This will check if the current canvas and project requires preparation. If the config allows,
 * it will automatically prepare the model. Otherwise it will show a prompt for the user to manually click
 * and prepare.
 *
 * If the user is assigned this task, it will always be auto-prepared.
 */
export const PrepareCanvasCaptureModel: React.FC = () => {
  const { isPreparing, hasExpired } = usePreparedCanvasModel();
  const { t } = useTranslation();

  if (hasExpired) {
    return <ErrorMessage>{t('Unable to claim this resource')}</ErrorMessage>;
  }

  if (isPreparing) {
    // This is causing a reflow issue that can't currently be resolved.
    // Related bug: https://github.com/pmndrs/react-use-measure/issues/9
    // return (
    //   <InfoMessage>
    //     <Spinner style={{ marginRight: 10 }} /> {t('Preparing this image')}
    //   </InfoMessage>
    // );
    return null;
  }

  return null;
};
