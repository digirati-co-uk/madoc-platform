import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { WidePage } from '../../../shared/layout/WidePage';
import { EditShorthandCaptureModel } from '../../../shared/capture-models/EditorShorthandCaptureModel';
import { siteConfigurationModel } from '../../../shared/configuration/site-config';
import { useApi } from '../../../shared/hooks/use-api';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { AdminHeader } from '../../molecules/AdminHeader';

function postProcessConfiguration(config: any) {
  if (config.revisionApprovalsRequired) {
    config.revisionApprovalsRequired = Number(config.revisionApprovalsRequired);
  }

  return config;
}

export const SiteProjectConfiguration: React.FC = () => {
  const { data: value, refetch } = apiHooks.getSiteConfiguration(() => []);
  const api = useApi();
  const history = useHistory();

  const [saveConfig] = useMutation(async (rev: any) => {
    await api.saveSiteConfiguration(postProcessConfiguration(rev));
    await refetch();
    history.push(`/configure/site?success=true`);
  });

  return (
    <>
      <AdminHeader
        title="Site configuration"
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Configure site', link: '/configure/site' },
          { label: 'Project configuration', link: '/configure/site/project' },
        ]}
      />
      <WidePage>
        <div style={{ maxWidth: 600 }}>
          <EditShorthandCaptureModel data={value} template={siteConfigurationModel} onSave={saveConfig} />
        </div>
      </WidePage>
    </>
  );
};
