import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { EditShorthandCaptureModel } from '../../../shared/capture-models/EditorShorthandCaptureModel';
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

  const config = {
    loginHeader: '',
    loginFooter: '',
    registerHeader: '',
    registerFooter: '',
    disableSearchIndexing: false,
    ...(savedConfig as any),
  };

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
          <EditShorthandCaptureModel data={config} template={systemConfigModel} onSave={updateSystemConfig} />
        </div>
      </WidePage>
    </>
  );
};
