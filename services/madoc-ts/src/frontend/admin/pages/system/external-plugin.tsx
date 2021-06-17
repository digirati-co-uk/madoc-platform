import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import { Button } from '../../../shared/atoms/Button';
import { SystemBackground } from '../../../shared/atoms/SystemUI';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { useSite } from '../../../shared/hooks/use-site';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { AdminHeader } from '../../molecules/AdminHeader';

export const ViewExternalPlugin: React.FC = () => {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const { t } = useTranslation();
  const { data } = useData(ViewExternalPlugin);
  const api = useApi();
  const site = useSite();

  const [install, installStatus] = useMutation(async (version?: string) => {
    await api.system.installExternalPlugin(owner, repo, version);
    window.location.href = `/s/${site.slug}/madoc/admin/system/plugins`;
  });

  return (
    <>
      <AdminHeader
        title={t('Remote plugin')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'All plugins', link: '/system/plugins' },
        ]}
        noMargin
      />

      <SystemBackground>
        <pre>{JSON.stringify(data, null, 2)}</pre>
        <Button $primary onClick={() => install()} disabled={installStatus.isLoading}>
          Install
        </Button>
      </SystemBackground>
    </>
  );
};

serverRendererFor(ViewExternalPlugin, {
  getKey: (params, query, pathname) => {
    return ['system-plugins', { owner: params.owner, repo: params.repo }];
  },
  getData: (key, vars, api, pathname) => {
    return api.system.viewExternalPlugin(vars.owner, vars.repo);
  },
});
