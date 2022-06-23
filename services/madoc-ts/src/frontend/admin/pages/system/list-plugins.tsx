import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'react-query';
import { Navigate } from 'react-router-dom';
import { SitePlugin } from '../../../../types/schemas/plugins';
import { useUser } from '../../../shared/hooks/use-site';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { EmptyState } from '../../../shared/layout/EmptyState';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import {
  SystemAction,
  SystemActions,
  SystemBackground,
  SystemDescription,
  SystemLinkBar,
  SystemMetadata,
  SystemName,
  SystemThumbnail,
  SystemVersion,
  SystemWarning,
} from '../../../shared/atoms/SystemUI';
import { ModalButton } from '../../../shared/components/Modal';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { Spinner } from '../../../shared/icons/Spinner';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { AdminHeader } from '../../molecules/AdminHeader';

const ConfirmDeletion: React.FC<{ pluginId: string }> = ({ pluginId }) => {
  const api = useApi();
  const { data } = useQuery(['plugin-dependencies', { pluginId }], async () => {
    return api.system.getPluginDependencies(pluginId);
  });

  if (!data) {
    return (
      <EmptyState>
        <Spinner />
      </EmptyState>
    );
  }

  if (data.dependencies) {
    return <div>Sorry you cannot remove this plugin, it is still enabled on {data.dependencies} site(s)</div>;
  }

  return <div>Are you sure you want to completely remove this plugin?</div>;
};

const ConfirmDeletionFooter: React.FC<{
  pluginId: string;
  close: () => void;
  uninstall: (id: string) => Promise<void>;
  isLoading?: boolean;
}> = ({ pluginId, close, uninstall, isLoading }) => {
  const api = useApi();
  const { data } = useQuery(['plugin-dependencies', { pluginId }], async () => {
    return api.system.getPluginDependencies(pluginId);
  });

  if (!data) {
    return null;
  }

  if (data.dependencies) {
    return null;
  }

  return (
    <ButtonRow $noMargin>
      <Button onClick={() => close()}>Cancel</Button>
      <Button disabled={isLoading} onClick={() => uninstall(pluginId).then(close)}>
        Uninstall
      </Button>
    </ButtonRow>
  );
};

export const ListPlugins: React.FC = () => {
  const { t } = useTranslation();
  const api = useApi();
  const user = useUser();

  const { data, refetch } = useData<{ plugins: SitePlugin[] }>(ListPlugins, undefined, {
    retry: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const [enablePlugin, enablePluginStatus] = useMutation(async (id: string) => {
    await api.system.enablePlugin(id);
    await refetch();
  });

  const [disablePlugin, disablePluginStatus] = useMutation(async (id: string) => {
    await api.system.disablePlugin(id);
    await refetch();
  });

  const [uninstall, uninstallStatus] = useMutation(async (id: string) => {
    await api.system.uninstallPlugin(id);
    await refetch();
  });

  if (user?.role !== 'global_admin') {
    return <Navigate to={'/'} />;
  }

  return (
    <>
      <AdminHeader title={t('Plugins')} breadcrumbs={[{ label: 'Site admin', link: '/' }]} noMargin />

      <SystemBackground>
        {data && data.plugins.length === 0 ? <EmptyState>No plugins installed yet</EmptyState> : null}
        {data ? (
          data.plugins.map(plugin => {
            return (
              <SystemListItem key={plugin.id} $enabled={plugin.enabled}>
                {plugin.thumbnail ? (
                  <SystemThumbnail>
                    <img src={plugin.thumbnail} alt="Plugin thumbnail" />
                  </SystemThumbnail>
                ) : null}
                <SystemMetadata>
                  <SystemName>{plugin.name}</SystemName>
                  <SystemDescription>{plugin.description}</SystemDescription>
                  <SystemLinkBar>
                    {plugin.repository.name && plugin.repository.owner ? (
                      <>
                        <a
                          href={`https://github.com/${plugin.repository.owner}/${plugin.repository.name}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          View on Github
                        </a>
                        <a
                          href={`https://github.com/${plugin.repository.owner}/${plugin.repository.name}/issues`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          Support
                        </a>
                      </>
                    ) : null}
                  </SystemLinkBar>
                  {plugin.development.enabled ? (
                    <SystemWarning>This plugin is in development mode</SystemWarning>
                  ) : null}
                  {plugin.development.enabled ? (
                    <SystemVersion>{plugin.development.revision} (development mode)</SystemVersion>
                  ) : (
                    <SystemVersion>v{plugin.version}</SystemVersion>
                  )}
                </SystemMetadata>
                <SystemActions>
                  <SystemActions>
                    {plugin.enabled ? (
                      <Button $error onClick={() => disablePlugin(plugin.id)} disabled={disablePluginStatus.isLoading}>
                        {t('Disable plugin')}
                      </Button>
                    ) : (
                      <>
                        {plugin.installed ? (
                          <SystemAction>
                            <Button
                              $primary
                              onClick={() => enablePlugin(plugin.id)}
                              disabled={enablePluginStatus.isLoading}
                            >
                              {t('Enable plugin')}
                            </Button>
                          </SystemAction>
                        ) : null}
                        <SystemAction>
                          <ModalButton
                            title="Uninstall plugin"
                            render={() => {
                              return <ConfirmDeletion pluginId={plugin.id} />;
                            }}
                            footerAlignRight
                            renderFooter={({ close }) => (
                              <ConfirmDeletionFooter
                                pluginId={plugin.id}
                                uninstall={uninstall}
                                close={close}
                                isLoading={uninstallStatus.isLoading}
                              />
                            )}
                          >
                            <Button $error>{t('Uninstall plugin')}</Button>
                          </ModalButton>
                        </SystemAction>
                      </>
                    )}
                  </SystemActions>
                </SystemActions>
              </SystemListItem>
            );
          })
        ) : (
          <Spinner />
        )}
      </SystemBackground>
    </>
  );
};

serverRendererFor(ListPlugins, {
  getKey: () => {
    return ['system-plugins', {}];
  },
  getData: (key, vars, api) => {
    return api.system.listPlugins();
  },
});
