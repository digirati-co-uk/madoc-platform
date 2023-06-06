import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { HrefLink } from '../../shared/utility/href-link';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { CollectionLoader } from '../pages/loaders/collection-loader';
import { GoToRandomCanvas } from './contributor/GoToRandomCanvas';
import { GoToRandomManifest } from './contributor/GoToRandomManifest';
import { useProjectPageConfiguration } from '../hooks/use-project-page-configuration';
import { useProjectStatus } from '../hooks/use-project-status';
import { useSiteConfiguration } from './SiteConfigurationContext';
import { useProjectShadowConfiguration } from '../hooks/use-project-shadow-configuration';

export const CollectionFilterOptions: React.FC = () => {
  const { t } = useTranslation();
  const { data } = usePaginatedData(CollectionLoader);

  const createLink = useRelativeLinks();
  const { filter, page } = useLocationQuery();
  const [, showDoneButton] = useSubjectMap(data ? data.subjects : []);
  const options = useProjectPageConfiguration();
  const { isActive } = useProjectStatus();
  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();
  const {
    project: { allowCollectionNavigation = true, allowManifestNavigation = true, claimGranularity },
  } = useSiteConfiguration();
  if (!data) {
    return null;
  }

  return (
    <>
      <ButtonRow>
        {!options.hideStartContributing && isActive ? (
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
      </ButtonRow>
      <ButtonRow>
        {showDoneButton || filter ? (
          <Button
            as={HrefLink}
            href={createLink({
              query: { filter: filter ? undefined : 3, page },
            })}
          >
            {filter ? t('Show completed') : t('Hide completed')}
          </Button>
        ) : null}
        <Button as={Link} to={createLink({ subRoute: 'search' })}>
          {t('Search this collection')}
        </Button>
        {allowCollectionNavigation && !options.hideRandomManifest && <GoToRandomManifest />}
        {allowManifestNavigation && !options.hideRandomCanvas && <GoToRandomCanvas />}
      </ButtonRow>
    </>
  );
};

blockEditorFor(CollectionFilterOptions, {
  requiredContext: ['collection'],
  editor: {},
  label: 'Collection filter options',
  type: 'default.CollectionFilterOptions',
});
