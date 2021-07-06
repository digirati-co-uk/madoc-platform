import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactTimeago from 'react-timeago';
import { siteManagerHooks } from '../../../../extensions/site-manager/hooks';
import { Button } from '../../../shared/atoms/Button';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import {
  SystemActions,
  SystemBackground,
  SystemDescription,
  SystemMetadata,
  SystemName,
  SystemVersion,
} from '../../../shared/atoms/SystemUI';
import { useSite } from '../../../shared/hooks/use-site';
import { AdminHeader } from '../../molecules/AdminHeader';

export const ListSites: React.FC = () => {
  const { t } = useTranslation();
  const currentSite = useSite();
  const { data } = siteManagerHooks.getAllSites(() => []);

  return (
    <>
      <AdminHeader title={t('Sites')} breadcrumbs={[{ label: 'Site admin', link: '/' }]} noMargin />

      <SystemBackground>
        {data?.sites.map(site => {
          return (
            <SystemListItem key={site.id} $enabled={site.slug === currentSite.slug}>
              <SystemMetadata>
                <SystemName>{site.title}</SystemName>
                <SystemDescription>{site.summary}</SystemDescription>
                <SystemVersion>
                  Created <ReactTimeago date={site.created} />
                </SystemVersion>
              </SystemMetadata>
              <SystemActions>
                <Button as="a" $disabled={site.slug === currentSite.slug} $primary href={`/s/${site.slug}/madoc/admin`}>
                  {t('Go to site')}
                </Button>
              </SystemActions>
            </SystemListItem>
          );
        })}
      </SystemBackground>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
};
