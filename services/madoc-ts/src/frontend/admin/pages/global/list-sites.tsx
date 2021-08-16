import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import ReactTimeago from 'react-timeago';
import { siteManagerHooks } from '../../../../extensions/site-manager/hooks';
import { Button, ButtonRow } from '../../../shared/atoms/Button';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../../shared/atoms/Statistics';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import {
  SystemActions,
  SystemBackground,
  SystemDescription,
  SystemMetadata,
  SystemName,
  SystemVersion,
} from '../../../shared/atoms/SystemUI';
import { useSite, useUser } from '../../../shared/hooks/use-site';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';

export const ListSites: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const currentSite = useSite();
  const { data } = siteManagerHooks.getAllSites(() => []);

  if (user?.role !== 'global_admin') {
    return <Redirect to={'/'} />;
  }

  return (
    <>
      <AdminHeader
        title={t('Sites')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Sites', link: '/global/sites', active: true },
        ]}
        noMargin
      />
      <SystemBackground>
        <ButtonRow>
          <Button as={HrefLink} href={`/global/sites/create`}>
            Create site
          </Button>
        </ButtonRow>

        {data?.sites.map(site => {
          const stats = {
            canvas: 0,
            projects: 0,
            manifest: 0,
            collection: 0,
            ...(data.siteStats[site.id] || {}),
          };

          return (
            <SystemListItem key={site.id} $enabled={site.slug === currentSite.slug}>
              <SystemMetadata>
                <SystemName>{site.title}</SystemName>
                <SystemDescription>{site.summary}</SystemDescription>
                <SystemDescription>
                  <StatisticContainer style={{ fontSize: '0.75em' }}>
                    <Statistic style={{ padding: '4px' }}>
                      <StatisticNumber>{stats.collection}</StatisticNumber>
                      <StatisticLabel style={{ fontSize: '1.1em' }}>Collections</StatisticLabel>
                    </Statistic>
                    <Statistic style={{ padding: '4px' }}>
                      <StatisticNumber>{stats.manifest}</StatisticNumber>
                      <StatisticLabel style={{ fontSize: '1.1em' }}>Manifests</StatisticLabel>
                    </Statistic>
                    <Statistic style={{ padding: '4px' }}>
                      <StatisticNumber>{stats.canvas}</StatisticNumber>
                      <StatisticLabel style={{ fontSize: '1.1em' }}>Canvases</StatisticLabel>
                    </Statistic>
                    <Statistic style={{ padding: '4px' }}>
                      <StatisticNumber>{stats.projects}</StatisticNumber>
                      <StatisticLabel style={{ fontSize: '1.1em' }}>Projects</StatisticLabel>
                    </Statistic>
                  </StatisticContainer>
                </SystemDescription>
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
    </>
  );
};
