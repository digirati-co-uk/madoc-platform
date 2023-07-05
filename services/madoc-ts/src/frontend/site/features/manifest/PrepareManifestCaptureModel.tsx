import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { InfoMessage } from '../../../shared/callouts/InfoMessage';
import { Spinner } from '../../../shared/icons/Spinner';
import { usePreparedManifestModel } from '../../hooks/use-prepared-manifest-model';

/**
 * Prepare Capture Model
 *
 * This will check if the current canvas and project requires preparation. If the config allows,
 * it will automatically prepare the model. Otherwise it will show a prompt for the user to manually click
 * and prepare.
 *
 * If the user is assigned this task, it will always be auto-prepared.
 */
export function PrepareManifestsCaptureModel() {
  const { isPreparing, hasExpired } = usePreparedManifestModel();

  const { t } = useTranslation();

  if (hasExpired) {
    return <ErrorMessage>{t('Unable to claim this resource')}</ErrorMessage>;
  }

  if (isPreparing) {
    // This is causing a reflow issue that can't currently be resolved.
    // Related bug: https://github.com/pmndrs/react-use-measure/issues/9
    return (
      <InfoMessage $banner>
        <Spinner style={{ marginRight: 10 }} /> {t('Preparing this manifest')}
      </InfoMessage>
    );
  }
  return null;
}
