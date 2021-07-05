import React, { useEffect } from 'react';
import { useSite } from '../../shared/hooks/use-site';
import { UniversalComponent } from '../../types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminHeader } from '../molecules/AdminHeader';
import { WidePage } from '../../shared/atoms/WidePage';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { useStaticData } from '../../shared/hooks/use-data';
import {
  Statistic,
  StatisticContainer,
  StatisticLabel,
  StatisticLink,
  StatisticNumber,
} from '../../shared/atoms/Statistics';

const AdminSection = styled.div`
  width: 25%;
`;

const AdminSectionGrid = styled.div`
  display: flex;
`;

const MenuTitle = styled.h4`
  margin-bottom: 1em;
`;

const MenuList = styled.div`
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.9em;
  a {
    color: #4157bb;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  li {
    margin-bottom: 0.3em;
  }
`;

type HomepageType = {
  query: {};
  params: {};
  variables: {};
  data: { collections: number; manifests: number; canvases: number; projects: number };
};

export const Homepage: UniversalComponent<HomepageType> = createUniversalComponent<HomepageType>(
  () => {
    const { data: stats } = useStaticData(Homepage);
    const { t } = useTranslation();
    const site = useSite();

    return (
      <div>
        <AdminHeader breadcrumbs={[{ label: 'Site admin', link: '/', active: true }]} title={t('Site admin')} />
        <WidePage>
          {stats ? (
            <StatisticContainer>
              <StatisticLink to="/collections" number={stats.collections} label="Collections" />
              <StatisticLink to="/manifests" number={stats.manifests} label="Manifests" />
              <Statistic>
                <StatisticNumber>{stats.canvases}</StatisticNumber>
                <StatisticLabel>Canvases</StatisticLabel>
              </Statistic>
              <StatisticLink to="/projects" number={stats.projects} label="Projects" />
            </StatisticContainer>
          ) : null}
          <AdminSectionGrid>
            <AdminSection>
              <MenuTitle>Content</MenuTitle>
              <MenuList>
                <li>
                  <a href={`/admin/site/s/${site.slug}/show/`}>{t('Omeka admin')}</a>
                </li>
                <li>
                  <Link to="/collections">{t('Manage collections', { count: 2 })}</Link>
                </li>
                <li>
                  <Link to="/manifests">{t('Manage manifests', { count: 2 })}</Link>
                </li>
                <li>
                  <Link to="/configure/site">{t('Site configuration')}</Link>
                </li>
                <li>
                  <Link to="/page-blocks">{t('Customise site pages')}</Link>
                </li>
                <li>
                  <Link to="/i18n">{t('Localisation')}</Link>
                </li>
                <li>
                  <Link to="/media">{t('Media')}</Link>
                </li>
              </MenuList>
            </AdminSection>
            <AdminSection>
              <MenuTitle>Crowdsourcing</MenuTitle>
              <MenuList>
                <li>
                  <Link to="/projects">{t('Manage projects', { count: 2 })}</Link>
                </li>
                {/* <li>
                  <Link to="/capture-models">{t('Manage capture models')}</Link>
                </li> */}
                <li>
                  <span>Reviews</span>
                </li>
                <li>
                  <span>Authority</span>
                </li>
              </MenuList>
            </AdminSection>
            <AdminSection>
              <MenuTitle>Enrichment</MenuTitle>
              <MenuList>
                <li>
                  <span>Segmentation</span>
                </li>
                <li>
                  <span>Import segmentation</span>
                </li>
                <li>
                  <Link to="/enrichment/search-indexing">{t('Search indexing')}</Link>
                </li>
                <li>
                  <Link to={`/enrichment/ocr`}>OCR</Link>
                </li>
              </MenuList>
            </AdminSection>
            <AdminSection>
              <MenuTitle>Content</MenuTitle>
              <MenuList>
                <li>
                  <span>Download contributions</span>
                </li>
                <li>
                  <span>Configure Universal Viewer</span>
                </li>
                <li>
                  <span>Configure Mirador</span>
                </li>
                <li>
                  <span>Configure Atlas</span>
                </li>
                <li>
                  <Link to={`/export/site`}>Export site</Link>
                </li>
                <li>
                  <Link to={`/sites/permissions`}>Site permissions</Link>
                </li>
              </MenuList>
            </AdminSection>
          </AdminSectionGrid>
        </WidePage>
      </div>
    );
  },
  {
    getKey: () => ['statistics', {}],
    getData: async (key, vars, api) => {
      return api.getStatistics();
    },
  }
);
