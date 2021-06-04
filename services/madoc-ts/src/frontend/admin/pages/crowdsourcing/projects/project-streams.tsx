import React from 'react';
import { useParams } from 'react-router-dom';
import { madocStreams } from '../../../../../activity-streams/madoc-streams';
import { ProjectFull } from '../../../../../types/schemas/project-full';
import { Button } from '../../../../shared/atoms/Button';
import { SystemBackground } from '../../../../shared/atoms/SystemBackground';
import { SystemListItem } from '../../../../shared/atoms/SystemListItem';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { HrefLink } from '../../../../shared/utility/href-link';
import { ViewActivityStream } from '../../system/activity-streams';

export const ProjectStreams = ({ project }: { project: ProjectFull }) => {
  const params = useParams<{ id: string; stream?: string }>();
  const { data: projectConfiguration } = apiHooks.getSiteConfiguration(() => [{ project_id: Number(params.id) }]);

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
