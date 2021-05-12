import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { useUser } from '../../shared/hooks/use-site';
import { useProject } from '../hooks/use-project';
import { useProjectPageConfiguration } from '../hooks/use-project-page-configuration';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { GoToRandomCanvas } from './GoToRandomCanvas';
import { GoToRandomManifest } from './GoToRandomManifest';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const ProjectActions: React.FC = () => {
  const { data: project } = useProject();
  const { isActive } = useProjectStatus();
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const {
    project: { allowCollectionNavigation = true, allowManifestNavigation = true, claimGranularity },
  } = useSiteConfiguration();
  const user = useUser();
  const isAdmin = user && user.scope && user.scope.indexOf('site.admin') !== -1;
  const isReviewer = isAdmin || (user && user.scope && user.scope.indexOf('tasks.create') !== -1);
  const options = useProjectPageConfiguration();

  if (!project) {
    return null;
  }

  return (
    <div>
      {!options.hideStartContributing && isActive ? (
        claimGranularity === 'manifest' ? (
          <GoToRandomManifest $primary $large label={{ none: [t('Start contributing')] }} navigateToModel />
        ) : (
          <GoToRandomCanvas $primary $large label={{ none: [t('Start contributing')] }} navigateToModel />
        )
      ) : null}
      <ButtonRow>
        {!options.hideSearchButton ? (
          <Button as={Link} to={createLink({ subRoute: 'search' })}>
            {t('Search this project')}
          </Button>
        ) : null}
        {isReviewer && isActive ? (
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
    </div>
  );
};

blockEditorFor(ProjectActions, {
  type: 'default.ProjectActions',
  label: 'Project actions',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});
