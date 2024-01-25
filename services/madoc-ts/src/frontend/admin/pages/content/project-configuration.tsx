import React, { useMemo } from 'react';
import { useMutation } from 'react-query';
import { WidePage } from '../../../shared/layout/WidePage';
import { postProcessConfiguration } from '../../../shared/configuration/site-config';
import { useApi } from '../../../shared/hooks/use-api';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { AdminHeader } from '../../molecules/AdminHeader';
import { ProjectConfigurationNEW } from '../../../../types/schemas/project-configuration';
import { migrateConfig } from '../../../../utility/config-migrations';
import { EditProjectConfiguration } from '../../components/EditProjectConfiguration';

export const SiteProjectConfiguration: React.FC = () => {
  const { data: _siteConfiguration, refetch, updatedAt } = apiHooks.getSiteConfiguration(() => []);
  const api = useApi();
  const { _source, ...siteConfiguration } = useMemo(() => {
    if (!_siteConfiguration) {
      return {} as ProjectConfigurationNEW;
    }

    return migrateConfig.version1to2(_siteConfiguration);
  }, [_siteConfiguration]);

  const [saveConfig] = useMutation(async (config: any) => {
    const toSave = migrateConfig.version2to1(config);
    await api.saveSiteConfiguration(postProcessConfiguration(toSave));
    await refetch();
  });

  return (
    <>
      <AdminHeader
        title="Site default project configuration"
        subtitle="Default configuration for projects on this site. This default configuration is overridden by specific project configuration"
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Configure site', link: '/configure/site' },
          { label: 'Project configuration', link: '/configure/site/project' },
        ]}
      />
      <WidePage>
        <EditProjectConfiguration
          old={false}
          updateKey={updatedAt}
          configuration={siteConfiguration}
          onSave={saveConfig}
        />
      </WidePage>
    </>
  );
};
