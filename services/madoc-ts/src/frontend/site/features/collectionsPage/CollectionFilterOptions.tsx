import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useSubjectMap } from '../../../shared/hooks/use-subject-map';
import { HrefLink } from '../../../shared/utility/href-link';
import { useRelativeLinks } from '../../hooks/use-relative-links';
import { CollectionLoader } from '../../pages/loaders/collection-loader';
import { GoToRandomCanvas } from '../sharedFeatures/GoToRandomCanvas';
import { GoToRandomManifest } from '../sharedFeatures/GoToRandomManifest';
import { useProjectPageConfiguration } from '../../hooks/use-project-page-configuration';
import { useSiteConfiguration } from '../SiteConfigurationContext';
import { StartContributingButton } from '../sharedFeatures/StartContributingButton';

export const CollectionFilterOptions: React.FC = () => {
  const { t } = useTranslation();
  const { data } = usePaginatedData(CollectionLoader);

  const createLink = useRelativeLinks();
  const { filter, page } = useLocationQuery();
  const [, showDoneButton] = useSubjectMap(data ? data.subjects : []);
  const options = useProjectPageConfiguration();
  const {
    project: { allowCollectionNavigation = true, allowManifestNavigation = true },
  } = useSiteConfiguration();
  if (!data) {
    return null;
  }

  return (
    <>
      <StartContributingButton />
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
