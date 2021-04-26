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
import { useUser } from '../../shared/hooks/use-site';
import { GoToRandomCanvas } from '../features/GoToRandomCanvas';
import { GoToRandomManifest } from '../features/GoToRandomManifest';
import { ProjectContributionButton } from '../features/ProjectContributionButton';
import { ProjectCollections } from '../features/ProjectCollections';
import { ProjectManifests } from '../features/ProjectManifests';
import { ProjectStatistics } from '../features/ProjectStatistics';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useProjectPageConfiguration } from '../hooks/use-project-page-configuration';
import { useRelativeLinks } from '../hooks/use-relative-links';

export const ViewProject: React.FC<Partial<{
  project: ProjectFull;
  collections: CollectionFull;
  manifests: CollectionFull;
}>> = props => {
  const { t } = useTranslation();
  const { project } = props;
  const createLink = useRelativeLinks();
  const {
    project: { allowCollectionNavigation = true, allowManifestNavigation = true },
  } = useSiteConfiguration();
  const user = useUser();
  const isAdmin = user && user.scope && user.scope.indexOf('site.admin') !== -1;
  const isReviewer = isAdmin || (user && user.scope && user.scope.indexOf('tasks.create') !== -1);
  const options = useProjectPageConfiguration();

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
        {!options.hideStartContributing ? (
          <GoToRandomCanvas $primary label={{ none: [t('Start contributing')] }} navigateToModel />
        ) : null}
        {!options.hideSearchButton ? (
          <Button as={Link} to={createLink({ subRoute: 'search' })}>
            {t('Search this project')}
          </Button>
        ) : null}
        {isReviewer ? (
          <Button
            as={Link}
            to={createLink({ projectId: project.id, subRoute: 'tasks', query: { type: 'crowdsourcing-review' } })}
          >
            {t('Reviews')}
          </Button>
        ) : null}
        {allowCollectionNavigation && !options.hideRandomManifest ? <GoToRandomManifest /> : null}
        {allowManifestNavigation && !options.hideRandomCanvas ? <GoToRandomCanvas /> : null}
      </ButtonRow>

      <ProjectContributionButton />

      <ProjectStatistics />

      <ProjectCollections />

      <ProjectManifests />
    </>
  );
};
