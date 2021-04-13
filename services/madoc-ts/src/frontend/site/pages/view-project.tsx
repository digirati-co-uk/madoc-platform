import React from 'react';
import { ProjectStatus } from '../../shared/atoms/ProjectStatus';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { LocaleString } from '../../shared/components/LocaleString';
import { ProjectFull } from '../../../types/schemas/project-full';
import { Heading1, Subheading1 } from '../../shared/atoms/Heading1';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { GoToRandomCanvas } from '../features/GoToRandomCanvas';
import { GoToRandomManifest } from '../features/GoToRandomManifest';
import { ProjectContributionButton } from '../features/ProjectContributionButton';
import { ProjectCollections } from '../features/ProjectCollections';
import { ProjectManifests } from '../features/ProjectManifests';
import { ProjectStatistics } from '../features/ProjectStatistics';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';

export const ViewProject: React.FC<Partial<{
  project: ProjectFull;
  collections: CollectionFull;
  manifests: CollectionFull;
}>> = props => {
  const { t } = useTranslation();
  const { project } = props;
  const {
    project: { allowCollectionNavigation = true, allowManifestNavigation = true },
  } = useSiteConfiguration();

  if (!project) {
    return null;
  }

  return (
    <>
      <DisplayBreadcrumbs />
      <ProjectStatus status={project.status} />
      <LocaleString as={Heading1}>{project.label}</LocaleString>
      <LocaleString as={Subheading1}>{project.summary}</LocaleString>

      <ButtonRow>
        <GoToRandomCanvas $primary label={{ none: [t('Start contributing')] }} navigateToModel />
        <Button as={Link} to={`/projects/${project.slug}/search`}>
          {t('Search this project')}
        </Button>
        {allowCollectionNavigation ? <GoToRandomManifest /> : null}
        {allowManifestNavigation ? <GoToRandomCanvas /> : null}
      </ButtonRow>

      <ProjectContributionButton />

      <ProjectStatistics />

      <ProjectCollections />

      <ProjectManifests />
    </>
  );
};
