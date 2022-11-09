import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { IIIFDragIcon } from '../../shared/components/IIIFDragIcon';
import { HrefLink } from '../../shared/utility/href-link';
import { useManifestPageConfiguration } from '../hooks/use-manifest-page-configuration';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useProjectShadowConfiguration } from '../hooks/use-project-shadow-configuration';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { AssignManifestToUser } from './AssignManifestToUser';
import { GoToFirstCanvas } from './GoToFirstCanvas';
import { GoToRandomCanvas } from './GoToRandomCanvas';
import { ManifestItemFilter } from './ManifestItemFilter';
import { ManifestTaskProgress } from './ManifestTaskProgress';
import { usePreventCanvasNavigation } from './PreventUsersNavigatingCanvases';
import { useSiteConfiguration } from './SiteConfigurationContext';

export type props = {
  alignment?: string;
};
export const ManifestActions: React.FC<props> = ({ alignment }) => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const options = useManifestPageConfiguration();
  const { showNavigationContent } = usePreventCanvasNavigation();
  const { isActive, isPreparing } = useProjectStatus();
  const {
    project: { claimGranularity, manifestPageOptions },
  } = useSiteConfiguration();
  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();
  const {
    isManifestComplete,
    userManifestTask,
    canClaimManifest,
    filteredTasks,
    isManifestInProgress,
  } = useManifestTask();
  const { done, inReview } = filteredTasks;

  const showButton =
    isActive &&
    !options.hideStartContributing &&
    !isManifestComplete &&
    (userManifestTask || canClaimManifest) &&
    !inReview.length &&
    !isManifestInProgress;

  const showIIIFLogo = manifestPageOptions?.showIIIFLogo;

  if (!showNavigationContent) {
    return null;
  }

  return (
    <>
      {showButton ? (
        <ButtonRow $center={alignment === 'center'} $right={alignment === 'right'}>
          {showCaptureModelOnManifest ? (
            <Button as={HrefLink} href={createLink({ subRoute: 'model' })} $primary $large>
              {userManifestTask && done.length ? t('View submission') : t('Start contributing')}
            </Button>
          ) : claimGranularity === 'manifest' ? (
            <GoToFirstCanvas $primary $large navigateToModel>
              {userManifestTask && done.length ? t('View submission') : t('Start contributing')}
            </GoToFirstCanvas>
          ) : (
            <GoToRandomCanvas $primary $large label={{ none: [t('Start contributing')] }} navigateToModel />
          )}
        </ButtonRow>
      ) : null}
      <ButtonRow $center={alignment === 'center'} $right={alignment === 'right'}>
        {showIIIFLogo ? <IIIFDragIcon /> : null}
        {!options.hideOpenInMirador ? (
          <Button
            as={HrefLink}
            href={createLink({
              subRoute: 'mirador',
            })}
          >
            {t('Open in mirador')}
          </Button>
        ) : null}

        {!options.hideSearchButton ? (
          <Button as={Link} to={createLink({ subRoute: 'search' })}>
            {t('Search this manifest')}
          </Button>
        ) : null}
        {!options.hideRandomCanvas ? <GoToRandomCanvas /> : null}
        {(isActive || isPreparing) && !options.hideFilterImages && !showCaptureModelOnManifest ? (
          <ManifestItemFilter />
        ) : null}
        <ManifestTaskProgress />
        {!showCaptureModelOnManifest ? <AssignManifestToUser /> : null}
      </ButtonRow>
    </>
  );
};

blockEditorFor(ManifestActions, {
  type: 'default.ManifestActions',
  label: 'Manifest actions',
  anyContext: ['manifest'],
  requiredContext: ['manifest'],
  defaultProps: {
    alignment: '',
  },
  editor: {
    alignment: {
      label: 'alignment',
      type: 'dropdown-field',
      options: [
        { value: 'left', text: 'Left aligned' },
        { value: 'center', text: 'Center aligned' },
        { value: 'right', text: 'Right aligned' },
      ],
    },
  },
});
