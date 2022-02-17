import React, { useMemo } from 'react';
import { useMutation } from 'react-query';
import { Site, SystemConfig } from '../../../../extensions/site-manager/types';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { EditShorthandCaptureModel } from '../../../shared/caputre-models/EditorShorthandCaptureModel';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { AdminHeader } from '../../molecules/AdminHeader';
import { WidePage } from '../../../shared/layout/WidePage';

const globalSystemConfigModel: Partial<{ [key in keyof SystemConfig]: any }> = {
  enableRegistrations: {
    label: 'User registrations',
    type: 'checkbox-field',
    inlineLabel: 'Allow users to register to the site',
  },
  registeredUserTranscriber: {
    label: 'User role',
    type: 'checkbox-field',
    inlineLabel: 'New users can contribute to crowdsourcing projects',
  },
  installationTitle: {
    label: 'Installation title',
    type: 'text-field',
  },
  defaultSite: {
    label: 'Slug of default site',
    type: 'dropdown-field',
  },
};

export const GlobalSystemConfig: React.FC = () => {
  const { data, refetch, updatedAt } = useData(GlobalSystemConfig);
  const api = useApi();
  const { systemConfig, allSites } = (data || {}) as { allSites: Site[]; systemConfig: SystemConfig };

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

    await refetch();
  });

  if (!systemConfig || !allSites || !globalSystemConfigModelWithSites) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <AdminHeader title="Site configuration" breadcrumbs={[{ label: 'Site admin', link: '/' }]} />
      <WidePage>
        <div style={{ maxWidth: 600 }}>
          {updateSystemConfigStatus.isSuccess ? <SuccessMessage>Config updated</SuccessMessage> : null}
          <EditShorthandCaptureModel
            key={updatedAt}
            data={systemConfig}
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
