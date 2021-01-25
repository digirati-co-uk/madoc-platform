import { RoundedCard } from '@capture-models/editor';
import React, { useState } from 'react';
import { EditShorthandCaptureModel } from '../../../shared/caputre-models/EditorShorthandCaptureModel';
import { WidePage } from '../../../shared/atoms/WidePage';
import { useApi } from '../../../shared/hooks/use-api';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { AdminHeader } from '../../molecules/AdminHeader';
import { siteConfigurationModel } from '../../../shared/configuration/site-config';

function postProcessConfiguration(config: any) {
  if (config.revisionApprovalsRequired) {
    config.revisionApprovalsRequired = Number(config.revisionApprovalsRequired);
  }

  return config;
}

export const SiteConfiguration: React.FC = () => {
  const { data: value, refetch } = apiHooks.getSiteConfiguration(() => []);
  const [siteConfig, setSiteConfig] = useState(false);
  const api = useApi();

  return (
    <>
      <AdminHeader
        title="Site configuration"
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Configure site', link: '/configure/site' },
        ]}
      />
      <WidePage>
        <div style={{ maxWidth: 600 }}>
          {siteConfig ? (
            <EditShorthandCaptureModel
              data={value}
              template={siteConfigurationModel}
              onSave={async rev => {
                setSiteConfig(false);
                await api.saveSiteConfiguration(postProcessConfiguration(rev));
                await refetch();
              }}
            />
          ) : (
            <>
              <RoundedCard
                label="Edit site configuration"
                interactive
                onClick={() => {
                  setSiteConfig(true);
                }}
              >
                Change the configuration for the site - this will be overridden by configuration on a project.
              </RoundedCard>
            </>
          )}
        </div>
      </WidePage>
    </>
  );
};
