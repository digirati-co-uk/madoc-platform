import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'react-query';
import styled, { css } from 'styled-components';
import { Button } from '../../../../shared/atoms/Button';
import { useApi } from '../../../../shared/hooks/use-api';
import { Spinner } from '../../../../shared/icons/Spinner';
import { AdminHeader } from '../../../molecules/AdminHeader';

const ThemesContainer = styled.div`
  padding: 3em;
  height: 100%;
  background: #d0d8e9;
`;

const ThemeItem = styled.div<{ $enabled?: boolean }>`
  padding: 1em;
  margin-bottom: 1em;
  margin-left: auto;
  margin-right: auto;
  background: #fff;
  border: 2px solid transparent;
  border-radius: 5px;
  display: flex;
  max-width: 800px;

  ${props =>
    props.$enabled &&
    css`
      border-color: #1c8c59;
    `}
`;

const ThemeThumbnail = styled.div`
  margin-right: 1em;
  width: 3.2em;
  height: 3.2em;
  border-radius: 3px;
  overflow: hidden;
  background: #999;

  img {
    width: 3.2em;
    height: 3.2em;
    object-fit: contain;
    object-position: 50% 50%;
  }
`;

const ThemeMetadata = styled.div`
  flex: 1 1 0px;
`;

const ThemeName = styled.div`
  font-size: 1.2em;
  margin-bottom: 0.5em;
`;

const ThemeVersion = styled.div`
  font-size: 0.8em;
  color: #999;
`;

const ThemeDescription = styled.div`
  font-size: 0.8em;
  margin-bottom: 0.5em;
`;

const ThemeActions = styled.div`
  text-align: right;
`;

const ThemeAction = styled.div<{ $error?: boolean }>`
  margin-bottom: 0.25em;
`;

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

      <ThemesContainer>
        {data ? (
          data.themes.map(theme => {
            return (
              <ThemeItem key={theme.id} $enabled={theme.enabled}>
                {theme.thumbnail ? (
                  <ThemeThumbnail>
                    <img src={theme.thumbnail} alt="Theme thumbnail" />
                  </ThemeThumbnail>
                ) : null}
                <ThemeMetadata>
                  <ThemeName>{theme.name}</ThemeName>
                  <ThemeDescription>{theme.description}</ThemeDescription>
                  <ThemeVersion>{theme.version}</ThemeVersion>
                </ThemeMetadata>
                <ThemeActions>
                  {!theme.onDisk ? <ThemeAction $error>Theme not found on disk.</ThemeAction> : null}
                  {theme.installed ? (
                    <ThemeAction>
                      {theme.enabled ? (
                        <Button disabled={disableThemeInfo.isLoading} $error onClick={() => disableTheme(theme.id)}>
                          {t('Disable theme')}
                        </Button>
                      ) : (
                        <Button $primary disabled={enableThemeInfo.isLoading} onClick={() => enableTheme(theme.id)}>
                          {t('Enable theme')}
                        </Button>
                      )}
                    </ThemeAction>
                  ) : null}
                  <ThemeAction>
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
                  </ThemeAction>
                </ThemeActions>
              </ThemeItem>
            );
          })
        ) : (
          <Spinner />
        )}
      </ThemesContainer>
    </>
  );
};
