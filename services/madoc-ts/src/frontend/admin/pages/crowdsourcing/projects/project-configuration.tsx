import React from 'react';
import { ProjectFull } from '../../../../../types/schemas/project-full';
import { EditShorthandCaptureModel } from '../../../../shared/caputre-models/EditorShorthandCaptureModel';
import { siteConfigurationModel } from '../../../../shared/configuration/site-config';
import { useApi } from '../../../../shared/hooks/use-api';
import { apiHooks } from '../../../../shared/hooks/use-api-query';

function postProcessConfiguration(config: any) {
  if (config.revisionApprovalsRequired) {
    config.revisionApprovalsRequired = Number(config.revisionApprovalsRequired);
  }

  return config;
}

export const ProjectConfiguration: React.FC<{ project: ProjectFull; refetch: () => Promise<void> }> = ({ project }) => {
  const api = useApi();
  const { data: projectConfiguration, refetch, updatedAt } = apiHooks.getSiteConfiguration(() => [
    { project_id: project.id },
  ]);

  return (
    <div>
      <EditShorthandCaptureModel
        key={updatedAt}
        data={projectConfiguration}
        template={siteConfigurationModel}
        onSave={async rev => {
          await api.saveSiteConfiguration(postProcessConfiguration(rev), { project_id: project.id });
          await refetch();
        }}
      />
    </div>
  );
};
