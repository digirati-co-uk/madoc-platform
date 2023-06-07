import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { useAdminLayout } from '../../../../shared/components/AdminMenu';
import {
  ProjectConfigContributions,
  ProjectConfigInterface,
  ProjectConfigOther,
  ProjectConfigReview,
  ProjectConfigSearch,
} from '../../../../shared/configuration/site-config';
import { useApi } from '../../../../shared/hooks/use-api';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { useProjectTemplate } from '../../../../shared/hooks/use-project-template';
import { useShortMessage } from '../../../../shared/hooks/use-short-message';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { InfoMessage } from '../../../../shared/callouts/InfoMessage';
import { Heading2 } from '../../../../shared/typography/Heading2';

export const ProjectConfigurationNew: React.FC = () => {
  const params = useParams() as { id: string };
  const { data: project } = apiHooks.getProject(() => (params.id ? [params.id] : undefined));

  const { scrollToTop } = useAdminLayout();
  const api = useApi();
  const { data: projectConfiguration, refetch, updatedAt } = apiHooks.getSiteConfiguration(() =>
    params.id ? [{ project_id: params.id }] : undefined
  );
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
      <InfoMessage>🚧 New Configuration WIP 🚧</InfoMessage>

    <Heading2>Interface</Heading2>

      <EditShorthandCaptureModel
        key={updatedAt}
        searchLabel={t('Search configuration')}
        immutableFields={projectTemplate?.configuration?.immutable}
        data={projectConfiguration}
        template={ProjectConfigInterface}
      />

      <Heading2>Search & browse</Heading2>
      <EditShorthandCaptureModel
        key={updatedAt}
        searchLabel={t('Search configuration')}
        immutableFields={projectTemplate?.configuration?.immutable}
        data={projectConfiguration}
        template={ProjectConfigSearch}
      />

      <Heading2>Contributions</Heading2>
      <EditShorthandCaptureModel
        key={updatedAt}
        searchLabel={t('Search configuration')}
        immutableFields={projectTemplate?.configuration?.immutable}
        data={projectConfiguration}
        template={ProjectConfigContributions}
      />

      <Heading2>Review process</Heading2>
      <EditShorthandCaptureModel
        key={updatedAt}
        searchLabel={t('Search configuration')}
        immutableFields={projectTemplate?.configuration?.immutable}
        data={projectConfiguration}
        template={ProjectConfigReview}
      />

      <Heading2>Other</Heading2>
      <EditShorthandCaptureModel
        key={updatedAt}
        searchLabel={t('Search configuration')}
        immutableFields={projectTemplate?.configuration?.immutable}
        data={projectConfiguration}
        template={ProjectConfigOther}
      />
    </div>
  );
};

serverRendererFor(ProjectConfigurationNew, {
  hooks: [
    { name: 'getProject', creator: params => [params.id] },
    { name: 'getSiteConfiguration', creator: params => [{ project_id: params.id }] },
  ],
});
