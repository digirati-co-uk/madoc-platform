import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Site, SystemConfig } from '../../../../extensions/site-manager/types';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { EditShorthandCaptureModel } from '../../../shared/capture-models/EditorShorthandCaptureModel';
import { globalSystemConfigModel } from '../../../shared/configuration/global-config';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { AdminHeader } from '../../molecules/AdminHeader';
import { WidePage } from '../../../shared/layout/WidePage';
import { ConfigurationImportExport } from '../../components/ConfigurationImportExport';

export const GlobalSystemConfig: React.FC = () => {
  const { data, refetch, updatedAt } = useData(GlobalSystemConfig);
  const api = useApi();
  const { t } = useTranslation();
  const { systemConfig, allSites } = (data || {}) as { allSites: Site[]; systemConfig: SystemConfig };
  const [importedConfig, setImportedConfig] = useState<SystemConfig>();

  const globalSystemConfigModelWithSites: any = useMemo(() => {
    if (!allSites) {
      return null;
    }

    return {
      ...globalSystemConfigModel,
      defaultSite: {
        ...globalSystemConfigModel.defaultSite,
        options: allSites.map(s => ({
          text: s.title,
          value: s.slug,
        })),
      },
    };
  }, [allSites]);

  const [updateSystemConfig, updateSystemConfigStatus] = useMutation(async (newConfig: any) => {
    await api.siteManager.updateSystemConfig(newConfig);
    setImportedConfig(undefined);
    await refetch();
  });

  if (!systemConfig || !allSites || !globalSystemConfigModelWithSites) {
    return <div>Loading...</div>;
  }
  const configuration = importedConfig || systemConfig;

  return (
    <>
      <AdminHeader title="Gobal configuration" breadcrumbs={[{ label: 'Site admin', link: '/' }]} />
      <WidePage>
        <div style={{ maxWidth: 600 }}>
          {updateSystemConfigStatus.isSuccess ? <SuccessMessage>Config updated</SuccessMessage> : null}
          <ConfigurationImportExport
            key={updatedAt}
            configuration={configuration}
            scope="global"
            onImport={newConfig => {
              updateSystemConfigStatus.reset();
              setImportedConfig(newConfig);
            }}
          />
          <EditShorthandCaptureModel
            keepExtraFields
            enableSearch
            searchLabel={t('Search configuration')}
            key={importedConfig ? JSON.stringify(importedConfig) : updatedAt}
            data={configuration}
            template={globalSystemConfigModelWithSites}
            onSave={updateSystemConfig}
          />
        </div>
      </WidePage>
    </>
  );
};

serverRendererFor(GlobalSystemConfig, {
  getKey: () => ['system-config', {}],
  async getData(key, vars, api) {
    return {
      systemConfig: await api.siteManager.getSystemConfig(),
      allSites: (await api.siteManager.getAllSites()).sites,
    };
  },
});
