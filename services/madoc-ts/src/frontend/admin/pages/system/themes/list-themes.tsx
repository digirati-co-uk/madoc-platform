import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'react-query';
import { Button } from '../../../../shared/atoms/Button';
import {
  SystemAction,
  SystemActions,
  SystemBackground,
  SystemDescription,
  SystemMetadata,
  SystemName,
  SystemThumbnail,
  SystemVersion,
} from '../../../../shared/atoms/SystemUI';
import { SystemListItem } from '../../../../shared/atoms/SystemListItem';
import { useApi } from '../../../../shared/hooks/use-api';
import { Spinner } from '../../../../shared/icons/Spinner';
import { AdminHeader } from '../../../molecules/AdminHeader';

export const ListThemes: React.FC = () => {
  const { t } = useTranslation();
  const api = useApi();
  const { data, refetch } = useQuery(['themes'], async () => {
    return api.themes.listThemes();
  });

  const [installTheme, installThemeInfo] = useMutation(async (id: string) => {
    await api.themes.installTheme(id);
    await refetch();
  });

  const [uninstallTheme, uninstallThemeInfo] = useMutation(async (id: string) => {
    await api.themes.uninstallTheme(id);
    await refetch();
  });

  const [enableTheme, enableThemeInfo] = useMutation(async (id: string) => {
    await api.themes.enableTheme(id);
    await refetch();
  });

  const [disableTheme, disableThemeInfo] = useMutation(async (id: string) => {
    await api.themes.disableTheme(id);
    await refetch();
  });

  return (
    <>
      <AdminHeader title={t('Themes')} breadcrumbs={[{ label: 'Site admin', link: '/' }]} noMargin />

      <SystemBackground>
        {data ? (
          data.themes.map(theme => {
            return (
              <SystemListItem key={theme.id} $enabled={theme.enabled}>
                {theme.thumbnail ? (
                  <SystemThumbnail>
                    <img src={theme.thumbnail} alt="Theme thumbnail" />
                  </SystemThumbnail>
                ) : null}
                <SystemMetadata>
                  <SystemName>{theme.name}</SystemName>
                  <SystemDescription>{theme.description}</SystemDescription>
                  <SystemVersion>{theme.version}</SystemVersion>
                </SystemMetadata>
                <SystemActions>
                  {!theme.onDisk ? <SystemAction $error>Theme not found on disk.</SystemAction> : null}
                  {theme.installed ? (
                    <SystemAction>
                      {theme.enabled ? (
                        <Button disabled={disableThemeInfo.isLoading} $error onClick={() => disableTheme(theme.id)}>
                          {t('Disable theme')}
                        </Button>
                      ) : (
                        <Button $primary disabled={enableThemeInfo.isLoading} onClick={() => enableTheme(theme.id)}>
                          {t('Enable theme')}
                        </Button>
                      )}
                    </SystemAction>
                  ) : null}
                  <SystemAction>
                    {theme.installed ? (
                      theme.enabled ? null : (
                        <Button disabled={uninstallThemeInfo.isLoading} $error onClick={() => uninstallTheme(theme.id)}>
                          {t('Uninstall theme')}
                        </Button>
                      )
                    ) : (
                      <Button $primary onClick={() => installTheme(theme.id)} disabled={installThemeInfo.isLoading}>
                        {t('install theme')}
                      </Button>
                    )}
                  </SystemAction>
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
