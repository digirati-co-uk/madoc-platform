import React from 'react';
import { AdminPageTitle, AdminPageSubtitle } from '../../shared/atoms/AdminPageTitle';
import styled, { css } from 'styled-components';
import { BreadcrumbItem, Breadcrumbs } from '../../shared/atoms/Breadcrumbs';
import { Link, useLocation } from 'react-router-dom';
import { WidePage } from '../../shared/atoms/WidePage';

const AdminHeaderBackground = styled.div`
  background: #333;
  margin-bottom: 1em;
`;

const AdminTabRow = styled.ul`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
`;

const AdminTabItem = styled.li<{ $active?: boolean }>`
  padding: 0.9em 1.5em;
  margin: 0 0.1em;
  font-size: 0.85em;
  color: #fff;
  text-decoration: none;
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    background: #4e82df;
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
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  menu?: BreadcrumbItem[];
  thumbnail?: string;
}> = ({ title, subtitle, breadcrumbs, menu, thumbnail }) => {
  const { pathname } = useLocation();

  return (
    <AdminHeaderBackground>
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
          <AdminTabRow>
            {menu.map((item, n) => (
              <AdminTabItem
                key={item.link}
                $active={pathname === item.link || (pathname.indexOf(item.link) !== -1 && n > 0)}
                as={Link}
                to={item.link}
              >
                {item.label}
              </AdminTabItem>
            ))}
          </AdminTabRow>
        ) : null}
      </WidePage>
    </AdminHeaderBackground>
  );
};
