import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectFull } from '../../../../../types/schemas/project-full';
import { SuccessMessage } from '../../../../shared/atoms/SuccessMessage';
import { EditShorthandCaptureModel } from '../../../../shared/caputre-models/EditorShorthandCaptureModel';
import { siteConfigurationModel } from '../../../../shared/configuration/site-config';
import { useApi } from '../../../../shared/hooks/use-api';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { useShortMessage } from '../../../../shared/hooks/use-short-message';

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
  const { t } = useTranslation();
  const [didSave, setDidSave] = useShortMessage();

  return (
    <div>
      {didSave ? <SuccessMessage>{t('Changes saved')}</SuccessMessage> : null}
      <EditShorthandCaptureModel
        key={updatedAt}
        data={projectConfiguration}
        template={siteConfigurationModel}
        onSave={async rev => {
          await api.saveSiteConfiguration(postProcessConfiguration(rev), { project_id: project.id });
          await refetch();
          setDidSave();
        }}
      />
    </div>
  );
};
