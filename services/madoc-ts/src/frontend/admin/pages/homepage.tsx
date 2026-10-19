import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnalyticsReport } from '../../../types/analytics';
import { useUser } from '../../shared/hooks/use-site';
import { UniversalComponent } from '../../types';
import { AdminHeader } from '../molecules/AdminHeader';
import { WidePage } from '../../shared/layout/WidePage';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { useStaticData } from '../../shared/hooks/use-data';
import {
  Statistic,
  StatisticContainer,
  StatisticLabel,
  StatisticLink,
  StatisticNumber,
} from '../../shared/atoms/Statistics';
import { AnalyticsOverview } from '../features/analytics/AnalyticsOverview';

function MenuSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <h4 className="text-base font-semibold mb-0">{title}</h4>
      <p className="text-xs font-medium text-gray-500 mt-1 mb-2.5">{subtitle}</p>
      <ul className="list-none m-0 p-0 space-y-3 text-sm">{children}</ul>
    </div>
  );
}

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-[#4157bb] no-underline hover:underline">
        {children}
      </Link>
    </li>
  );
}

type HomepageType = {
  query: Record<string, never>;
  params: Record<string, never>;
  variables: Record<string, never>;
  data: { collections: number; manifests: number; canvases: number; projects: number; analytics?: AnalyticsReport };
};

export const Homepage: UniversalComponent<HomepageType> = createUniversalComponent<HomepageType>(
  () => {
    const { data: stats } = useStaticData(Homepage);
    const { t } = useTranslation();
    const user = useUser();
    const isGlobal = user?.role === 'global_admin';

    return (
      <div>
        <AdminHeader breadcrumbs={[{ label: t('Admin dashboard'), link: '/', active: true }]} title={t('Site admin')} />
        <WidePage>
          <AnalyticsOverview data={stats?.analytics} />

          {stats ? (
            <StatisticContainer>
              <StatisticLink
                to="/collections"
                number={stats.collections}
                label="Collections"
                cypressCountLabel="collection-count"
              />
              <StatisticLink
                to="/manifests"
                number={stats.manifests}
                label="Manifests"
                cypressCountLabel="manifest-count"
              />
              <Statistic>
                <StatisticNumber data-cy="canvas-count">{stats.canvases}</StatisticNumber>
                <StatisticLabel>Canvases</StatisticLabel>
              </Statistic>
              <StatisticLink
                to="/projects"
                number={stats.projects}
                label="Projects"
                cypressCountLabel="project-count"
              />
            </StatisticContainer>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto">
            <MenuSection title={t('Content')} subtitle={t('Create and manage site content')}>
              <MenuLink to="/analytics">{t('Analytics')}</MenuLink>
              <MenuLink to="/manifests">{t('Manifests')}</MenuLink>
              <MenuLink to="/collections">{t('Collections')}</MenuLink>
              <MenuLink to="/media">{t('Media')}</MenuLink>
              <MenuLink to="/page-blocks">{t('Site pages')}</MenuLink>
              <MenuLink to="/i18n">{t('Localisation')}</MenuLink>
            </MenuSection>

            <MenuSection title={t('Crowdsourcing')} subtitle={t(' Public contribution and enrichment')}>
              <MenuLink to="/projects">{t('Projects')}</MenuLink>
              <MenuLink to="/enrichment/ocr">{t('OCR')}</MenuLink>
              <MenuLink to="/system/activity-streams">{t('Activity streams')}</MenuLink>
            </MenuSection>

            <MenuSection title={t('Configuration')} subtitle={t('Configure how this site works and appears')}>
              <MenuLink to="/configure/site/details">{t('Site details')}</MenuLink>
              <MenuLink to="/configure/site/system">{t('Site general configuration')}</MenuLink>
              <MenuLink to="/configure/site/project">{t('Site Project configuration')}</MenuLink>
              <MenuLink to="/enrichment/search-indexing">{t('Site search indexing')}</MenuLink>
              <MenuLink to="/enrichment/typesense-playground">{t('Typesense playground')}</MenuLink>
              <MenuLink to="/site/permissions">{t('Site permissions')}</MenuLink>
              <MenuLink to="/system/themes">{t('Themes')}</MenuLink>
            </MenuSection>

            {isGlobal ? (
              <MenuSection title={t('Global')} subtitle={t('System-wide administration')}>
                <MenuLink to="/global/sites">{t('All Sites')}</MenuLink>
                <MenuLink to="/global/users">{t('Users')}</MenuLink>
                <MenuLink to="/global/status">{t('System status')}</MenuLink>
                <MenuLink to="/global/logs">{t('Process logs')}</MenuLink>
                <MenuLink to="/global/queue">{t('Queue inspector')}</MenuLink>
                <MenuLink to="/global/config">{t('Global config')}</MenuLink>
                <MenuLink to="/global/api-keys">{t('API keys')}</MenuLink>
              </MenuSection>
            ) : null}
          </div>
        </WidePage>
      </div>
    );
  },
  {
    getKey: () => ['statistics', {}],
    getData: async (key, vars, api) => {
      const [statistics, analytics] = await Promise.all([
        api.getStatistics(),
        api.getAnalytics({ days: 30 }).catch(() => undefined),
      ]);
      return { ...statistics, analytics };
    },
  }
);
