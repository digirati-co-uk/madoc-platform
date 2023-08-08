import React from 'react';
import { useProjectStatus } from '../../hooks/use-project-status';
import { useTranslation } from 'react-i18next';
import { useSiteConfiguration } from '../SiteConfigurationContext';
import { useUser } from '../../../shared/hooks/use-site';
import { useProjectPageConfiguration } from '../../hooks/use-project-page-configuration';
import { useProjectShadowConfiguration } from '../../hooks/use-project-shadow-configuration';
import { GoToRandomManifest } from '../manifest/GoToRandomManifest';
import { GoToRandomCanvas } from '../canvas/GoToRandomCanvas';

export const StartContributingButton: React.FC = () => {
  const { isActive } = useProjectStatus();
  const { t } = useTranslation();
  const {
    project: { claimGranularity },
  } = useSiteConfiguration();
  const user = useUser();
  const isAdmin = user && user.scope && user.scope.indexOf('site.admin') !== -1;
  const canContribute = isAdmin || (user && user.scope && user.scope.indexOf('models.contribute') !== -1);
  const options = useProjectPageConfiguration();
  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();

  return (
    <div>
      {!options.hideStartContributing && isActive && canContribute ? (
        claimGranularity === 'manifest' || showCaptureModelOnManifest ? (
          <GoToRandomManifest
            $primary
            $large
            label={{ none: [t('Start contributing')] }}
            navigateToModel
            manifestModel={showCaptureModelOnManifest}
          />
        ) : (
          <GoToRandomCanvas $primary $large label={{ none: [t('Start contributing')] }} navigateToModel />
        )
      ) : null}
    </div>
  );
};
