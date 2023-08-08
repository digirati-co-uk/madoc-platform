import React from 'react';
import { useTranslation } from 'react-i18next';
import { useProject } from '../../hooks/use-project';
import { useRouteContext } from '../../hooks/use-route-context';
import { ProjectListingDescription, ProjectListingItem, ProjectListingTitle } from '../../../shared/atoms/ProjectListing';
import { Button } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';
import { LocaleString } from '../../../shared/components/LocaleString';

export const ProjectDetailWrapper: React.FC<{ message?: any }> = ({ message, children }) => {
  const { projectId } = useRouteContext();
  const { data: project } = useProject();
  const { t } = useTranslation();

  if (!projectId) {
    return null;
  }

  return (
    <div>
      <ProjectListingItem key={projectId}>
        <ProjectListingTitle>
          <HrefLink href={`/projects/${projectId}`}>
            <LocaleString>{project ? project.label : { none: ['...'] }}</LocaleString>
          </HrefLink>
        </ProjectListingTitle>
        {project ? (
          <ProjectListingDescription>
            {project ? <LocaleString>{project.summary}</LocaleString> : null}
          </ProjectListingDescription>
        ) : null}
        {children || (
          <Button disabled style={{ opacity: 0 }}>
            {t('...')}
          </Button>
        )}
      </ProjectListingItem>
      {message}
    </div>
  );
};
