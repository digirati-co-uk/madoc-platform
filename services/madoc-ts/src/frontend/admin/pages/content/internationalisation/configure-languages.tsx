import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Button, SmallButton } from '../../../../shared/atoms/Button';
import { EmptyState } from '../../../../shared/atoms/EmptyState';
import { TickIcon } from '../../../../shared/atoms/TickIcon';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { ModalButton } from '../../../../shared/components/Modal';
import { useApi } from '../../../../shared/hooks/use-api';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { useSupportedLocales } from '../../../../shared/hooks/use-site';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../../shared/utility/href-link';
import { AdminHeader } from '../../../molecules/AdminHeader';
import * as locale from 'locale-codes';
import { SimpleTable } from '../../../../shared/atoms/SimpleTable';

export const ConfigureLanguages: React.FC = () => {
  const { t, i18n } = useTranslation();
  const supportedLocales = useSupportedLocales();
  const [showAll, setShowAll] = useState(false);
  const api = useApi();

  const toShow = useMemo(() => {
    return showAll
      ? locale.all
      : locale.all.filter(item => {
          return !item.location;
        });
  }, [showAll]);

  const locales = apiHooks.getSiteLocales(() => []);
  const analysis = apiHooks.getLocaleAnalysis(() => []);
  const flatContentLocales = locales.data?.contentLanguages || [];
  const displayLanguages = locales.data?.displayLanguages || [];
  const flatEnabled = locales.data?.displayLanguages || [];

  const availableLocales: any[] = (locales.data?.localisations || []).filter(availLocale => {
    return flatEnabled.indexOf(availLocale.code) === -1;
  });
  const enabledLocales: any[] = (locales.data?.localisations || []).filter(availLocale => {
    return flatEnabled.indexOf(availLocale.code) !== -1;
  });
  const contentLocales: any[] = (locale.all || []).filter(availLocale => {
    return flatContentLocales.indexOf(availLocale.tag) !== -1;
  });

  const [disableTranslation, disableTranslationStatus] = useMutation(async (tag: string) => {
    await api.updateLocalePreferences({
      displayLanguages: displayLanguages.filter(t => t !== tag),
    });
    await locales.refetch();
  });

  const [enableTranslation, enableTranslationStatus] = useMutation(async (tag: string) => {
    await api.updateLocalePreferences({
      displayLanguages: [...new Set([...displayLanguages, tag])],
    });
    await locales.refetch();
  });

  const [enableContent, enableContentStatus] = useMutation(async (tag: string) => {
    await api.updateLocalePreferences({
      contentLanguages: [...new Set([...flatContentLocales, tag])],
    });
    await locales.refetch();
  });

  const [disableContent, disableContentStatus] = useMutation(async (tag: string) => {
    await api.updateLocalePreferences({
      contentLanguages: flatContentLocales.filter((t: string) => t !== tag),
    });
    await locales.refetch();
  });

  const isLoading =
    disableTranslationStatus.isLoading ||
    enableTranslationStatus.isLoading ||
    enableContentStatus.isLoading ||
    disableContentStatus.isLoading;

  const suggestions = (analysis.data?.metadata || []).filter(metadataSuggested => {
    return flatContentLocales.indexOf(metadataSuggested.language) === -1;
  });

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Localisation', active: true, link: `/i18n` },
        ]}
        title={t('Configure languages')}
      />
      <WidePage>
        <h3>{t('Enabled translations')}</h3>
        <p>{t('If enabled, these will will be available for users to choose from the menu bar')}</p>
        <SimpleTable.Table>
          <tbody>
            {enabledLocales.map(enabledLocale => {
              const data = locale.getByTag(enabledLocale.code);
              return (
                <SimpleTable.Row>
                  <SimpleTable.Cell>
                    <TickIcon />
                  </SimpleTable.Cell>
                  <SimpleTable.Cell>
                    <HrefLink to={`/i18n/edit/${enabledLocale.code}`}>{data.name}</HrefLink>
                  </SimpleTable.Cell>
                  <SimpleTable.Cell>{data.local}</SimpleTable.Cell>
                  <SimpleTable.Cell>{data.location || '-'}</SimpleTable.Cell>
                  <SimpleTable.Cell>{data.tag}</SimpleTable.Cell>
                  <SimpleTable.Cell>{enabledLocale.isStatic ? 'static' : 'dynamic'}</SimpleTable.Cell>
                  <SimpleTable.Cell>
                    <SmallButton onClick={() => disableTranslation(enabledLocale.code)} disabled={isLoading}>
                      {t('Hide translation on site')}
                    </SmallButton>
                  </SimpleTable.Cell>
                  <SimpleTable.Cell>
                    {flatContentLocales.indexOf(enabledLocale.code) === -1 ? (
                      <SmallButton onClick={() => enableContent(enabledLocale.code)} disabled={isLoading}>
                        {t('Enable on content')}
                      </SmallButton>
                    ) : (
                      <SmallButton $primary onClick={() => disableContent(enabledLocale.code)} disabled={isLoading}>
                        {t('Disable on content')}
                      </SmallButton>
                    )}
                  </SimpleTable.Cell>
                  <SimpleTable.Cell>
                    <SmallButton onClick={() => i18n.changeLanguage(enabledLocale.code)}>
                      {t('Switch to {{name}}', {
                        name: data.local || data.name,
                      })}
                    </SmallButton>
                  </SimpleTable.Cell>
                  <SimpleTable.Cell>
                    <HrefLink to={`/i18n/edit/${enabledLocale.code}`}>{t('Edit translation')}</HrefLink>
                  </SimpleTable.Cell>
                </SimpleTable.Row>
              );
            })}
          </tbody>
        </SimpleTable.Table>

        <h3>{t('Available translations')}</h3>
        <p>{t('These are translations that you can choose to enable for display')}</p>
        {availableLocales.length ? (
          <SimpleTable.Table>
            <tbody>
              {availableLocales.map(availableLocale => {
                const data = locale.getByTag(availableLocale.code);
                return (
                  <SimpleTable.Row>
                    <SimpleTable.Cell>
                      <TickIcon />
                    </SimpleTable.Cell>
                    <SimpleTable.Cell>
                      <HrefLink to={`/i18n/edit/${availableLocale.code}`}>{data.name}</HrefLink>
                    </SimpleTable.Cell>
                    <SimpleTable.Cell>{data.local}</SimpleTable.Cell>
                    <SimpleTable.Cell>{data.location || '-'}</SimpleTable.Cell>
                    <SimpleTable.Cell>{data.tag}</SimpleTable.Cell>
                    <SimpleTable.Cell>{availableLocale.isStatic ? 'static' : 'dynamic'}</SimpleTable.Cell>
                    <SimpleTable.Cell>
                      <SmallButton onClick={() => enableTranslation(availableLocale.code)} disabled={isLoading}>
                        {t('Show translation on site')}
                      </SmallButton>
                    </SimpleTable.Cell>
                    <SimpleTable.Cell>
                      {flatContentLocales.indexOf(availableLocale.code) === -1 ? (
                        <SmallButton onClick={() => enableContent(availableLocale.code)} disabled={isLoading}>
                          {t('Enable on content')}
                        </SmallButton>
                      ) : (
                        <SmallButton $primary onClick={() => disableContent(availableLocale.code)} disabled={isLoading}>
                          {t('Disable on content')}
                        </SmallButton>
                      )}
                    </SimpleTable.Cell>
                    <SimpleTable.Cell>
                      <SmallButton onClick={() => i18n.changeLanguage(availableLocale.code)}>
                        {t('Switch to {{name}}', {
                          name: data.local || data.name,
                        })}
                      </SmallButton>
                    </SimpleTable.Cell>
                    <SimpleTable.Cell>
                      <HrefLink to={`/i18n/edit/${availableLocale.code}`}>{t('Edit translation')}</HrefLink>
                    </SimpleTable.Cell>
                  </SimpleTable.Row>
                );
              })}
            </tbody>
          </SimpleTable.Table>
        ) : (
          <EmptyState>{t('No translations')}</EmptyState>
        )}

        <h3>{t('Content languages')}</h3>
        <p>{t('These will show when adding metadata to IIIF items')}</p>

        {contentLocales.length ? (
          <SimpleTable.Table>
            <tbody>
              {contentLocales.map(contentLocale => {
                const data = locale.getByTag(contentLocale.tag);
                return (
                  <SimpleTable.Row>
                    <SimpleTable.Cell>{data.name}</SimpleTable.Cell>
                    <SimpleTable.Cell>{data.local}</SimpleTable.Cell>
                    <SimpleTable.Cell>{data.tag}</SimpleTable.Cell>
                    <SimpleTable.Cell>
                      <SmallButton $primary onClick={() => disableContent(data.tag)} disabled={isLoading}>
                        {t('Disable on content')}
                      </SmallButton>
                    </SimpleTable.Cell>
                  </SimpleTable.Row>
                );
              })}
            </tbody>
          </SimpleTable.Table>
        ) : (
          <EmptyState>{t('No translations')}</EmptyState>
        )}

        {suggestions.length ? (
          <>
            <h4>{t('Suggested translations')}</h4>
            <p>{t('The following languages were found in content you imported')}</p>
            <SimpleTable.Table>
              <tbody>
                {suggestions.map(suggestion => {
                  const data = locale.getByTag(suggestion.language);
                  return (
                    <SimpleTable.Row>
                      <SimpleTable.Cell>{data.name}</SimpleTable.Cell>
                      <SimpleTable.Cell>{data.local}</SimpleTable.Cell>
                      <SimpleTable.Cell>{data.tag}</SimpleTable.Cell>
                      <SimpleTable.Cell>
                        {t('Found {{count}} occurrences', { count: suggestion.totals })}
                      </SimpleTable.Cell>
                      <SimpleTable.Cell>
                        <SmallButton $primary onClick={() => enableContent(data.tag)} disabled={isLoading}>
                          {t('Enable on content')}
                        </SmallButton>
                      </SimpleTable.Cell>
                    </SimpleTable.Row>
                  );
                })}
              </tbody>
            </SimpleTable.Table>
          </>
        ) : null}

        <h3>{t('All locales')}</h3>

        <Button onClick={() => setShowAll(e => !e)}>
          {showAll ? t('Show only languages') : t('Show all locales')}
        </Button>

        <SimpleTable.Table>
          <thead>
            <tr>
              <th />
              <th>{t('Name')}</th>
              <th>{t('Local name')}</th>
              {showAll ? <th>{t('Location')}</th> : null}
              <th>{t('Tag')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {toShow.map(item => {
              const exists = supportedLocales.indexOf(item.tag) !== -1;
              return (
                <SimpleTable.Row key={item.tag}>
                  <SimpleTable.Cell>{exists ? <TickIcon /> : null}</SimpleTable.Cell>
                  <SimpleTable.Cell>{item.name}</SimpleTable.Cell>
                  <SimpleTable.Cell>{item.local}</SimpleTable.Cell>
                  {showAll ? <SimpleTable.Cell>{item.location || '-'}</SimpleTable.Cell> : null}
                  <SimpleTable.Cell>{item.tag}</SimpleTable.Cell>
                  <SimpleTable.Cell>
                    {exists ? (
                      <SmallButton $primary as={HrefLink} href={`/i18n/edit/${item.tag}`}>
                        {t('Edit')}
                      </SmallButton>
                    ) : (
                      <ModalButton
                        as={SmallButton}
                        title={t(`Create translation for {{name}}`, { name: item.name })}
                        render={() => {
                          return (
                            <div>
                              {t('help__translation_popup', {
                                defaultValue:
                                  'There are no translations available for this language. When you create a language here you will be presented with all of the translatable strings to provide translations.',
                              })}
                            </div>
                          );
                        }}
                        renderFooter={() => {
                          return (
                            <Button as={HrefLink} to={`/i18n/edit/${item.tag}`}>
                              {t('Create translation')}
                            </Button>
                          );
                        }}
                      >
                        {t('Create translation')}
                      </ModalButton>
                    )}
                  </SimpleTable.Cell>
                  <SimpleTable.Cell>
                    {flatContentLocales.indexOf(item.tag) === -1 ? (
                      <SmallButton onClick={() => enableContent(item.tag)} disabled={isLoading}>
                        {t('Enable on content')}
                      </SmallButton>
                    ) : (
                      <SmallButton $primary onClick={() => disableContent(item.tag)} disabled={isLoading}>
                        {t('Disable on content')}
                      </SmallButton>
                    )}
                  </SimpleTable.Cell>
                </SimpleTable.Row>
              );
            })}
          </tbody>
        </SimpleTable.Table>
      </WidePage>
    </>
  );
};

serverRendererFor(ConfigureLanguages, {
  hooks: [
    {
      name: 'getSiteLocales',
      creator: () => [],
    },
    {
      name: 'getLocaleAnalysis',
      creator: () => [],
    },
  ],
});
