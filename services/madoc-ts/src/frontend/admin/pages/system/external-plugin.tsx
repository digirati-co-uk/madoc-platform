import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Navigate, useParams } from 'react-router-dom';
import { RemotePlugin } from '../../../../types/plugins';
import { Button } from '../../../shared/navigation/Button';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import {
  SystemActions,
  SystemBackground,
  SystemDescription,
  SystemLinkBar,
  SystemMetadata,
  SystemName,
  SystemThumbnail,
} from '../../../shared/atoms/SystemUI';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { useSite, useUser } from '../../../shared/hooks/use-site';
import { Spinner } from '../../../shared/icons/Spinner';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { AdminHeader } from '../../molecules/AdminHeader';

export const ViewExternalPlugin: React.FC = () => {
  const { owner, repo } = useParams() as { owner: string; repo: string };
  const { t } = useTranslation();
  const { data } = useData<RemotePlugin>(ViewExternalPlugin);
  const api = useApi();
  const site = useSite();
  const user = useUser();

  const [install, installStatus] = useMutation(async (version?: string) => {
    await api.system.installExternalPlugin(owner, repo, version);
    window.location.href = `/s/${site.slug}/admin/system/plugins`;
  });

  if (user?.role !== 'global_admin') {
    return <Navigate to={'/'} />;
  }

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
        {data ? (
          <>
            <SystemListItem>
              {data.owner.logo ? (
                <SystemThumbnail>
                  <img src={data.owner.logo} alt={data.owner.name} />
                </SystemThumbnail>
              ) : null}
              <SystemMetadata>
                <SystemName>
                  <a rel="noopener noreferrer" target="_blank" href={data.url}>
                    {data.name}
                  </a>
                </SystemName>
                <SystemDescription>{data.description}</SystemDescription>
                <SystemLinkBar>
                  <span>Created by</span>
                  <a rel="noopener noreferrer" target="_blank" href={data.owner.url}>
                    {data.owner.name}
                  </a>
                </SystemLinkBar>

                <SystemLinkBar>
                  <>
                    <a href={data.url} rel="noopener noreferrer" target="_blank">
                      View on Github
                    </a>
                    <a href={`${data.url}/issues`} rel="noopener noreferrer" target="_blank">
                      {data.issues} Issues
                    </a>
                    <span>{data.stars} Stars</span>
                  </>
                </SystemLinkBar>
              </SystemMetadata>
              <SystemActions>
                {data.installed ? (
                  data.upToDate ? (
                    <Button $primary disabled>
                      Up to date
                    </Button>
                  ) : (
                    <Button $primary onClick={() => install()}>
                      Update ({data.installedVersion} to {data.latestVersion})
                    </Button>
                  )
                ) : (
                  <Button $primary onClick={() => install()} disabled={!data.installable || installStatus.isLoading}>
                    {data.installable ? 'Install' : 'Cannot install'}
                  </Button>
                )}
              </SystemActions>
            </SystemListItem>
          </>
        ) : (
          <Spinner />
        )}
      </SystemBackground>
    </>
  );
};

serverRendererFor(ViewExternalPlugin, {
  getKey: params => {
    return ['external-plugin', { owner: params.owner, repo: params.repo }];
  },
  getData: async (key, vars, api) => {
    return api.system.viewExternalPlugin(vars.owner, vars.repo);
  },
});
