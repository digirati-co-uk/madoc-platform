import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectFull } from '../../../../../types/project-full';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { EditShorthandCaptureModel } from '../../../../shared/caputre-models/EditorShorthandCaptureModel';
import { useAdminLayout } from '../../../../shared/components/AdminMenu';
import { siteConfigurationModel } from '../../../../shared/configuration/site-config';
import { useApi } from '../../../../shared/hooks/use-api';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { useProjectTemplate } from '../../../../shared/hooks/use-project-template';
import { useShortMessage } from '../../../../shared/hooks/use-short-message';

function postProcessConfiguration(config: any) {
  if (config.revisionApprovalsRequired) {
    config.revisionApprovalsRequired = Number(config.revisionApprovalsRequired);
  }

  return config;
}

export const ProjectConfiguration: React.FC<{ project: ProjectFull; refetch: () => Promise<void> }> = ({ project }) => {
  const { scrollToTop } = useAdminLayout();
  const api = useApi();
  const { data: projectConfiguration, refetch, updatedAt } = apiHooks.getSiteConfiguration(() => [
    { project_id: project.id },
  ]);
  const { t } = useTranslation();
  const [didSave, setDidSave] = useShortMessage();
  const projectTemplate = useProjectTemplate(project.template);

  if (projectTemplate?.configuration?.frozen) {
    return <EmptyState>{t('There is no configuration for this project type')}</EmptyState>;
  }

  return (
    <div>
      {didSave ? <SuccessMessage>{t('Changes saved')}</SuccessMessage> : null}
      <EditShorthandCaptureModel
        key={updatedAt}
        immutableFields={projectTemplate?.configuration?.immutable}
        data={projectConfiguration}
        template={siteConfigurationModel}
        onSave={async rev => {
          await api.saveSiteConfiguration(postProcessConfiguration(rev), { project_id: project.id });
          await refetch();
          setDidSave();
          scrollToTop();
        }}
      />
    </div>
  );
};
