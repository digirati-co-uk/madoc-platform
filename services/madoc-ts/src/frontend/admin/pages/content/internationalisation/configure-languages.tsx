import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SmallButton } from '../../../../shared/atoms/Button';
import { TickIcon } from '../../../../shared/atoms/TickIcon';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { ModalButton } from '../../../../shared/components/Modal';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { useSupportedLocales } from '../../../../shared/hooks/use-site';
import { HrefLink } from '../../../../shared/utility/href-link';
import { AdminHeader } from '../../../molecules/AdminHeader';
import * as locale from 'locale-codes';
import { SimpleTable } from '../../../../shared/atoms/SimpleTable';

export const ConfigureLanguages: React.FC = () => {
  const { t, i18n } = useTranslation();
  const supportedLocales = useSupportedLocales();
  const [showAll, setShowAll] = useState(false);

  const toShow = useMemo(() => {
    return showAll
      ? locale.all
      : locale.all.filter(item => {
          return !item.location;
        });
  }, [showAll]);

  const locales = apiHooks.getSiteLocales(() => []);

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
        <h3>{t('Current translations')}</h3>
        <SimpleTable.Table>
          <tbody>
            {locales.data?.localisations.map(item => {
              const data = locale.getByTag(item.code);
              return (
                <SimpleTable.Row>
                  <SimpleTable.Cell>
                    <TickIcon />
                  </SimpleTable.Cell>
                  <SimpleTable.Cell>
                    <HrefLink to={`/i18n/edit/${item.code}`}>{data.name}</HrefLink>
                  </SimpleTable.Cell>
                  <SimpleTable.Cell>{data.local}</SimpleTable.Cell>
                  <SimpleTable.Cell>{data.location || '-'}</SimpleTable.Cell>
                  <SimpleTable.Cell>{data.tag}</SimpleTable.Cell>
                  <SimpleTable.Cell>{item.isStatic ? 'static' : 'dynamic'}</SimpleTable.Cell>
                  <SimpleTable.Cell>
                    <SmallButton onClick={() => i18n.changeLanguage(item.code)}>
                      {t('Switch to {{name}}', {
                        name: data.local || data.name,
                      })}
                    </SmallButton>
                  </SimpleTable.Cell>
                  <SimpleTable.Cell>
                    <HrefLink to={`/i18n/edit/${item.code}`}>{t('Edit translation')}</HrefLink>
                  </SimpleTable.Cell>
                </SimpleTable.Row>
              );
            })}
          </tbody>
        </SimpleTable.Table>

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
                      <SmallButton as={HrefLink} href={`/i18n/edit/${item.tag}`}>
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
                </SimpleTable.Row>
              );
            })}
          </tbody>
        </SimpleTable.Table>
      </WidePage>
    </>
  );
};
