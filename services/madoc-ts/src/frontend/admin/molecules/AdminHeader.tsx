import React from 'react';
import { AdminPageTitle, AdminPageSubtitle } from '../../shared/typography/AdminPageTitle';
import styled, { css } from 'styled-components';
import { BreadcrumbItem, Breadcrumbs } from '../../shared/navigation/Breadcrumbs';
import { Link, useLocation } from 'react-router-dom';
import { WidePage } from '../../shared/layout/WidePage';
import { SearchBox } from '../../shared/atoms/SearchBox';
import { GridContainer } from '../../shared/layout/Grid';

const AdminHeaderBackground = styled.div<{ $sticky?: boolean; $noMargin?: boolean }>`
  background: #24386b;
  margin-bottom: 1em;
  ${props =>
    props.$sticky &&
    css`
      position: sticky;
      top: -0.25px;
      z-index: 9;
    `}

  ${props =>
    props.$noMargin &&
    css`
      margin-bottom: 0;
    `}
`;

const AdminTabRow = styled.ul`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
`;

const AdminTabItem = styled.li<{ $active?: boolean }>`
  padding: 0.9em 1.5em;
  margin: 0 0.2em;
  font-size: 0.85em;
  color: #fff;
  background: #435da0;
  text-decoration: none;
  &:hover {
    //background: rgba(255, 255, 255, 0.2);
    background: #dcebfe;
    color: #000;
  }
  ${props =>
    props.$active &&
    css`
      background: #fff;
      color: #000;
      &:hover {
        background: #fff;
      }
    `}
`;

const AdminHeaderThumbnail = styled.div`
  padding: 1em 0;
  max-height: 150px;
  img {
    height: 100%;
    max-height: 100%;
    width: auto;
  }
`;

const AdminHeaderGrid = styled.div`
  display: flex;
`;

const TitleContainer = styled.div`
  flex: 1 1 0px;
  margin-right: auto;
`;

export const AdminHeader: React.FC<{
  title: any;
  sticky?: boolean;
  subtitle?: any;
  breadcrumbs?: BreadcrumbItem[];
  menu?: Array<BreadcrumbItem | null>;
  thumbnail?: string;
  search?: boolean;
  noMargin?: boolean;
  searchFunction?: (val: string) => [{}];
}> = ({ title, subtitle, breadcrumbs, menu, noMargin, thumbnail, search = false, searchFunction, sticky }) => {
  const { pathname } = useLocation();
  return (
    <AdminHeaderBackground $noMargin={noMargin} $sticky={sticky}>
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <WidePage>
        <AdminHeaderGrid style={{ display: 'flex' }}>
          {thumbnail ? (
            <AdminHeaderThumbnail>
              <img src={thumbnail} />
            </AdminHeaderThumbnail>
          ) : null}
          <TitleContainer>
            <AdminPageTitle subtitle={!!subtitle}>{title}</AdminPageTitle>
            {subtitle ? <AdminPageSubtitle>{subtitle}</AdminPageSubtitle> : null}
          </TitleContainer>
        </AdminHeaderGrid>
        {menu ? (
          <GridContainer $justify={'space-between'}>
            <AdminTabRow>
              {menu.map((item, n) =>
                item ? (
                  <AdminTabItem
                    key={item.link}
                    $active={item.active || pathname === item.link || (pathname.indexOf(item.link) !== -1 && n > 0)}
                    as={Link}
                    to={item.link}
                  >
                    {item.label}
                  </AdminTabItem>
                ) : null
              )}
            </AdminTabRow>
            {search && searchFunction ? <SearchBox isAdmin={true} onSearch={val => searchFunction(val)} /> : null}
          </GridContainer>
        ) : null}
      </WidePage>
    </AdminHeaderBackground>
  );
};
