import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { EditShorthandCaptureModel } from '../../../shared/capture-models/EditorShorthandCaptureModel';
import { useApi } from '../../../shared/hooks/use-api';
import { useSite, useSystemConfig, useUpdateSystemConfig } from '../../../shared/hooks/use-site';
import { AdminHeader } from '../../molecules/AdminHeader';
import { WidePage } from '../../../shared/layout/WidePage';
import { ConfigurationImportExport } from '../../components/ConfigurationImportExport';
import type { SiteSystemConfig } from '../../../../extensions/site-manager/types';

const systemConfigModel = {
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
  autoPublishImport: {
    label: 'Auto publish',
    type: 'checkbox-field',
    inlineLabel: 'Automatically publish manifest after importing',
  },
  disableSearchIndexing: {
    label: 'Disable search indexing',
    type: 'checkbox-field',
    inlineLabel: 'Disable automatic search indexing tasks after contributions',
  },
  // Login/Register messages
  loginHeader: {
    label: 'Login header message',
    description: 'Message to display above the login form',
    type: 'text-field',
    multiline: true,
    minLines: 4,
  },
  loginFooter: {
    label: 'Login footer message',
    description: 'Message to display below the login form',
    type: 'text-field',
    multiline: true,
    minLines: 4,
  },
  registerHeader: {
    label: 'Register header message',
    description: 'Message to display above the registration form',
    type: 'text-field',
    multiline: true,
    minLines: 4,
  },
  registerFooter: {
    label: 'Register footer message',
    description: 'Message to display below the registration form',
    type: 'text-field',
    multiline: true,
    minLines: 4,
  },
};

export const SiteSystemConfiguration: React.FC = () => {
  const api = useApi();
  const savedConfig = useSystemConfig();
  const updateConfig = useUpdateSystemConfig();
  const navigate = useNavigate();
  const site = useSite();
  const [importedConfig, setImportedConfig] = useState<Partial<SiteSystemConfig>>();

  const config: Partial<SiteSystemConfig> = {
    loginHeader: '',
    loginFooter: '',
    registerHeader: '',
    registerFooter: '',
    disableSearchIndexing: false,
    ...savedConfig,
    ...importedConfig,
  };

  const editableConfig = Object.fromEntries(
    Object.keys(systemConfigModel).map(key => [key, config[key as keyof SiteSystemConfig]])
  ) as Partial<SiteSystemConfig>;

  const [updateSystemConfig] = useMutation(async (newConfig: any) => {
    await api.siteManager.updateSite({
      config: newConfig,
    });
    const siteDetails = await api.getSiteDetails(site.id);

    updateConfig({
      ...config,
      ...(siteDetails?.config || {}),
    });

    navigate(`/configure/site?success=true`);
  });

  return (
    <>
      <AdminHeader
        title="Site general configuration"
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Configure site', link: '/configure/site' },
          { label: 'Site general configuration', link: '/configure/site/system' },
        ]}
      />
      <WidePage>
        <div style={{ maxWidth: 600 }}>
          <ConfigurationImportExport configuration={editableConfig} scope="site" onImport={setImportedConfig} />
          <EditShorthandCaptureModel
            key={importedConfig ? JSON.stringify(importedConfig) : undefined}
            data={editableConfig}
            template={systemConfigModel}
            onSave={updateSystemConfig}
          />
        </div>
      </WidePage>
    </>
  );
};
