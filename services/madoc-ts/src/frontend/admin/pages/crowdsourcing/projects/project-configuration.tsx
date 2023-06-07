import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { useAdminLayout } from '../../../../shared/components/AdminMenu';
import { postProcessConfiguration, siteConfigurationModel } from '../../../../shared/configuration/site-config';
import { useApi } from '../../../../shared/hooks/use-api';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { useProjectTemplate } from '../../../../shared/hooks/use-project-template';
import { useShortMessage } from '../../../../shared/hooks/use-short-message';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';

export const ProjectConfiguration: React.FC = () => {
  const params = useParams() as { id: string };
  const { data: project } = apiHooks.getProject(() => (params.id ? [params.id] : undefined));

  const { scrollToTop } = useAdminLayout();
  const api = useApi();
  const { data: _projectConfiguration, refetch, updatedAt } = apiHooks.getSiteConfiguration(() =>
    params.id ? [{ project_id: params.id, show_source: true }] : undefined
  );

  const { _source, ...projectConfiguration } = _projectConfiguration || {};

  const { t } = useTranslation();
  const [didSave, setDidSave] = useShortMessage();
  const projectTemplate = useProjectTemplate(project?.template);

  if (projectTemplate?.configuration?.frozen) {
    return <EmptyState>{t('There is no configuration for this project type')}</EmptyState>;
  }

  if (!project) {
    return null;
  }

  return (
    <div>
      {didSave ? <SuccessMessage>{t('Changes saved')}</SuccessMessage> : null}
      <EditShorthandCaptureModel
        key={updatedAt}
        enableSearch
        searchLabel={t('Search configuration')}
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

serverRendererFor(ProjectConfiguration, {
  hooks: [
    { name: 'getProject', creator: params => [params.id] },
    { name: 'getSiteConfiguration', creator: params => [{ project_id: params.id }] },
  ],
});
