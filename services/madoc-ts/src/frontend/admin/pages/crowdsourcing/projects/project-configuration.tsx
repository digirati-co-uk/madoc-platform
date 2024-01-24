import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ProjectConfigurationNEW } from '../../../../../types/schemas/project-configuration';
import { migrateConfig } from '../../../../../utility/config-migrations';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { postProcessConfiguration } from '../../../../shared/configuration/site-config';
import { useApi } from '../../../../shared/hooks/use-api';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { useProjectTemplate } from '../../../../shared/hooks/use-project-template';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { EditProjectConfiguration } from '../../../components/EditProjectConfiguration';

export const ProjectConfiguration: React.FC = () => {
  const params = useParams() as { id: string };
  const { data: project } = apiHooks.getProject(() => (params.id ? [params.id] : undefined), {
    refetchOnWindowFocus: false,
  });

  const api = useApi();
  const {
    data: _projectConfiguration,
    refetch,
    updatedAt,
  } = apiHooks.getSiteConfiguration(() => (params.id ? [{ project_id: params.id, show_source: true }] : undefined), {
    refetchOnWindowFocus: false,
    forceFetchOnMount: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnReconnect: false,
  });

  const { _source, ...projectConfiguration } = useMemo(() => {
    if (!_projectConfiguration) {
      return {} as ProjectConfigurationNEW;
    }

    return migrateConfig.version1to2(_projectConfiguration);
  }, [_projectConfiguration]);

  const { t } = useTranslation();
  const projectTemplate = useProjectTemplate(project?.template);

  const save = async (config: ProjectConfigurationNEW) => {
    if (!project) {
      return;
    }

    const toSave = migrateConfig.version2to1(config);
    await api.saveSiteConfiguration(postProcessConfiguration(toSave), { project_id: project.id });
    await refetch();
  };

  if (projectTemplate?.configuration?.frozen) {
    return <EmptyState>{t('There is no configuration for this project type')}</EmptyState>;
  }

  if (!project || !_projectConfiguration || !projectConfiguration) {
    return null;
  }

  return (
    <EditProjectConfiguration
      updateKey={updatedAt}
      configuration={projectConfiguration}
      onSave={save}
      immutableFields={projectTemplate?.configuration?.immutable}
    />
  );
};

serverRendererFor(ProjectConfiguration, {
  hooks: [
    { name: 'getProject', creator: params => [params.id] },
    { name: 'getSiteConfiguration', creator: params => [{ project_id: params.id }] },
  ],
});
