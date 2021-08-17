import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { madocStreams } from '../../../../../activity-streams/madoc-streams';
import { ProjectFull } from '../../../../../types/schemas/project-full';
import { Button } from '../../../../shared/atoms/Button';
import { EmptyState } from '../../../../shared/atoms/EmptyState';
import { SystemBackground } from '../../../../shared/atoms/SystemUI';
import { SystemListItem } from '../../../../shared/atoms/SystemListItem';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { useProjectTemplate } from '../../../../shared/hooks/use-project-template';
import { HrefLink } from '../../../../shared/utility/href-link';
import { ViewActivityStream } from '../../sites/activity-streams';

export const ProjectStreams = ({ project }: { project: ProjectFull }) => {
  const { t } = useTranslation();
  const params = useParams<{ id: string; stream?: string }>();
  const { data: projectConfiguration } = apiHooks.getSiteConfiguration(() => [{ project_id: Number(params.id) }]);
  const template = useProjectTemplate(project?.template);
  const noActivity = template?.configuration?.activity?.noActivity;

  if (noActivity) {
    return <EmptyState>{t('No activity streams for this project')}</EmptyState>;
  }

  if (!projectConfiguration) {
    return null;
  }

  const config = projectConfiguration?.activityStreams || {};

  if (params.stream) {
    return (
      <SystemBackground $rounded>
        <ViewActivityStream name={params.stream} secondary={project.slug} />
      </SystemBackground>
    );
  }

  return (
    <div>
      <SystemBackground $rounded>
        <SystemListItem>
          <div>
            <h3>{madocStreams['curated-project-manifests'].displayName}</h3>
            <p>{madocStreams['curated-project-manifests'].description}</p>
            <Button
              as={HrefLink}
              disabled={!config.curated}
              $primary
              href={`/projects/${project.id}/activity/curated-project-manifests`}
            >
              {config.curated ? 'View stream' : 'Enable in project config'}
            </Button>
          </div>
        </SystemListItem>

        <SystemListItem>
          <div>
            <h3>{madocStreams['project-manifest-feed'].displayName}</h3>
            <p>{madocStreams['project-manifest-feed'].description}</p>
            <Button
              as={HrefLink}
              disabled={!config.curated}
              $primary
              href={`/projects/${project.id}/activity/project-manifest-feed`}
            >
              {config.curated ? 'View stream' : 'Enable in project config'}
            </Button>
          </div>
        </SystemListItem>
      </SystemBackground>
    </div>
  );
};
