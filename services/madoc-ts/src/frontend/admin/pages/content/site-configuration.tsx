import { RoundedCard } from '@capture-models/editor';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SuccessMessage } from '../../../shared/atoms/SuccessMessage';
import { EditShorthandCaptureModel } from '../../../shared/caputre-models/EditorShorthandCaptureModel';
import { WidePage } from '../../../shared/atoms/WidePage';
import { useApi } from '../../../shared/hooks/use-api';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { useShortMessage } from '../../../shared/hooks/use-short-message';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';
import { siteConfigurationModel } from '../../../shared/configuration/site-config';

function postProcessConfiguration(config: any) {
  if (config.revisionApprovalsRequired) {
    config.revisionApprovalsRequired = Number(config.revisionApprovalsRequired);
  }

  return config;
}

export const SiteConfiguration: React.FC = () => {
  const { t } = useTranslation();
  const { data: value, refetch } = apiHooks.getSiteConfiguration(() => []);
  const [siteConfig, setSiteConfig] = useState(false);
  const [didSave, setDidSave] = useShortMessage();
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
        {didSave ? <SuccessMessage>{t('Changes saved')}</SuccessMessage> : null}
        <div style={{ maxWidth: 600 }}>
          {siteConfig ? (
            <EditShorthandCaptureModel
              data={value}
              template={siteConfigurationModel}
              onSave={async rev => {
                await api.saveSiteConfiguration(postProcessConfiguration(rev));
                setSiteConfig(false);
                await refetch();
                setDidSave();
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
              <HrefLink href={`/configure/site/metadata`} style={{ textDecoration: 'none' }}>
                <RoundedCard label="Edit metadata configuration" interactive>
                  Change which metadata is visible on the site and in what order. Combine properties.
                </RoundedCard>
              </HrefLink>
            </>
          )}
        </div>
      </WidePage>
    </>
  );
};
