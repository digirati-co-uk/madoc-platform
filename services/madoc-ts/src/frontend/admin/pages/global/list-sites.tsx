import { stringify } from 'query-string';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { siteManagerHooks } from '../../../../extensions/site-manager/hooks';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import { SystemCallToAction } from '../../../shared/components/SystemCallToAction';
import { SystemOrderBy } from '../../../shared/components/SystemOrderBy';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { Button } from '../../../shared/navigation/Button';
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
import { AdminHeader } from '../../molecules/AdminHeader';
import {
  Input,
  InputCheckboxContainer,
  InputCheckboxInputContainer,
  InputContainer,
  InputLabel,
} from '../../../shared/form/Input';

export const ListSites: React.FC = () => {
  const { t } = useTranslation();
  const [archived, setArchived] = useState(false);
  const user = useUser();
  const currentSite = useSite();
  const query = useLocationQuery();
  const { data } = siteManagerHooks.getAllSites(() => [{ desc: query.desc, order_by: query.order_by }], {
    keepPreviousData: true,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const search = (query?.search || '').toLowerCase();

  const filteredSites = useMemo(() => {
    if (!data?.sites) {
      return [];
    }
    if (!search && archived) {
      return data.sites;
    }
    return data.sites.filter(site => {
      if (!archived && site.title.toLocaleLowerCase().includes('[archived]')) {
        return false;
      }

      if (!search) {
        return true;
      }

      return (
        site.title.toLowerCase().indexOf(search) !== -1 ||
        (site.summary || '').toLowerCase().indexOf(search) !== -1 ||
        site.slug.toLowerCase().indexOf(search) !== -1
      );
    });
  }, [query, search, data, archived]);

  if (user?.role !== 'global_admin') {
    return <Navigate to={'/'} />;
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
        <SystemCallToAction
          title={t('Create a new site')}
          href={`/global/sites/create`}
          description={t('Create a new space')}
          maxWidth
        />

        <SystemOrderBy
          liveSearch
          initialSearch={search}
          initialValue={query.order_by}
          initialDesc={query.desc}
          maxWidth
          items={['title', 'slug', 'created']}
          onSearch={q => {
            navigate(
              `${location.pathname}${
                q || query.order_by
                  ? `?${stringify({ order_by: query.order_by, desc: query.desc ? 'true' : undefined, search: q })}`
                  : ''
              }`
            );
          }}
          onChange={opt => {
            navigate(
              `${location.pathname}${
                opt.value
                  ? `?${stringify({
                      order_by: opt.value,
                      desc: opt.desc ? 'true' : undefined,
                      search: search || undefined,
                    })}`
                  : ''
              }`
            );
          }}
        />
        <div style={{ maxWidth: 800, margin: 'auto' }}>
          <InputContainer>
            <InputCheckboxContainer>
              <InputCheckboxInputContainer $checked={archived}>
                <Input type="checkbox" id="archived" checked={archived} onChange={e => setArchived(e.target.checked)} />
              </InputCheckboxInputContainer>
              <InputLabel htmlFor="archived">Include archived</InputLabel>
            </InputCheckboxContainer>
          </InputContainer>
        </div>

        {filteredSites.map(site => {
          const stats = {
            canvas: 0,
            projects: 0,
            manifest: 0,
            collection: 0,
            ...(data?.siteStats[site.id] || {}),
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
                  Created <TimeAgo date={site.created} />
                </SystemVersion>
              </SystemMetadata>
              <SystemActions>
                <Button
                  as="a"
                  $disabled={site.slug === currentSite.slug}
                  $primary
                  href={`/s/${currentSite.slug}/login/refresh?redirect=/s/${site.slug}/admin`}
                >
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
