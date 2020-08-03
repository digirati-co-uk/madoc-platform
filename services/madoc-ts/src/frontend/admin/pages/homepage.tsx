import React from 'react';
import { UniversalComponent } from '../../types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminHeader } from '../molecules/AdminHeader';
import { WidePage } from '../../shared/atoms/WidePage';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { useStaticData } from '../../shared/hooks/use-data';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../shared/atoms/Statistics';

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

const Homepage: UniversalComponent<HomepageType> = createUniversalComponent<HomepageType>(
  () => {
    const { data: stats } = useStaticData(Homepage);
    const { t } = useTranslation();

    return (
      <div>
        <AdminHeader breadcrumbs={[{ label: 'Site admin', link: '/', active: true }]} title={t('Site admin')} />
        <WidePage>
          {stats ? (
            <StatisticContainer>
              <Statistic>
                <StatisticNumber>{stats.collections}</StatisticNumber>
                <StatisticLabel>Collections</StatisticLabel>
              </Statistic>
              <Statistic>
                <StatisticNumber>{stats.manifests}</StatisticNumber>
                <StatisticLabel>Manifests</StatisticLabel>
              </Statistic>
              <Statistic>
                <StatisticNumber>{stats.canvases}</StatisticNumber>
                <StatisticLabel>Canvases</StatisticLabel>
              </Statistic>
              <Statistic>
                <StatisticNumber>{stats.projects}</StatisticNumber>
                <StatisticLabel>Projects</StatisticLabel>
              </Statistic>
            </StatisticContainer>
          ) : null}
          <AdminSectionGrid>
            <AdminSection>
              <MenuTitle>Content</MenuTitle>
              <MenuList>
                <li>
                  <Link to="/collections">{t('Manage collections')}</Link>
                </li>
                <li>
                  <Link to="/manifests">{t('Manage manifests')}</Link>
                </li>
                <li>
                  <span>Content configuration</span>
                </li>
                <li>
                  <span>Customise site pages</span>
                </li>
                <li>
                  <span>Blog posts</span>
                </li>
              </MenuList>
            </AdminSection>
            <AdminSection>
              <MenuTitle>Crowdsourcing</MenuTitle>
              <MenuList>
                <li>
                  <Link to="/projects">{t('Manage projects')}</Link>
                </li>
                <li>
                  <Link to="/capture-models">{t('Manage capture models')}</Link>
                </li>
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
                  <span>Search indexing</span>
                </li>
                <li>
                  <span>OCR</span>
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

export { Homepage };
