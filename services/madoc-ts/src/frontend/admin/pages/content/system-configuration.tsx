import React from 'react';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { EditShorthandCaptureModel } from '../../../shared/caputre-models/EditorShorthandCaptureModel';
import { useApi } from '../../../shared/hooks/use-api';
import { useSite, useSystemConfig, useUpdateSystemConfig } from '../../../shared/hooks/use-site';
import { AdminHeader } from '../../molecules/AdminHeader';
import { WidePage } from '../../../shared/layout/WidePage';

const systemConfigModel = {
  enableRegistrations: {
    label: 'User registrations',
    type: 'checkbox-field',
    inlineLabel: 'Allow users to register to the site',
  },
};

export const SiteSystemConfiguration: React.FC = () => {
  const api = useApi();
  const config = useSystemConfig();
  const updateConfig = useUpdateSystemConfig();
  const history = useHistory();
  const site = useSite();

  const [updateSystemConfig] = useMutation(async (newConfig: any) => {
    await api.siteManager.updateSite({
      config: newConfig,
    });
    const siteDetails = await api.getSiteDetails(site.id);

    updateConfig({
      ...config,
      ...(siteDetails?.config || {}),
    });

    history.push(`/configure/site?success=true`);
  });

  return (
    <>
      <AdminHeader
        title="Site configuration"
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Configure site', link: '/configure/site' },
          { label: 'Site-wide configuration', link: '/configure/site/system' },
        ]}
      />
      <WidePage>
        <div style={{ maxWidth: 600 }}>
          <EditShorthandCaptureModel data={config} template={systemConfigModel} onSave={updateSystemConfig} />
        </div>
      </WidePage>
    </>
  );
};
