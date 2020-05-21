import React from 'react';
import { AdminPageTitle, AdminPageSubtitle } from '../atoms/AdminPageTitle';
import styled, { css } from 'styled-components';
import { BreadcrumbItem, Breadcrumbs } from '../atoms/Breadcrumbs';
import { Link, useLocation } from 'react-router-dom';
import { WidePage } from '../atoms/WidePage';

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

const AdminTabItem = styled.li<{ active?: boolean }>`
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
    props.active &&
    css`
      background: #fff;
      color: #000;
      &:hover {
        background: #fff;
      }
    `}
`;

export const AdminHeader: React.FC<{
  title: any;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  menu?: BreadcrumbItem[];
}> = ({ title, subtitle, breadcrumbs, menu }) => {
  const { pathname } = useLocation();

  return (
    <AdminHeaderBackground>
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      <WidePage>
        <AdminPageTitle subtitle={!!subtitle}>{title}</AdminPageTitle>
        {subtitle ? <AdminPageSubtitle>{subtitle}</AdminPageSubtitle> : null}
        {menu ? (
          <AdminTabRow>
            {menu.map((item, n) => (
              <AdminTabItem
                key={item.link}
                active={pathname === item.link || (pathname.indexOf(item.link) !== -1 && n > 0)}
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
