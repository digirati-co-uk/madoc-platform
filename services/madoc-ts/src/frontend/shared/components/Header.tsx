import React from 'react';
import { PageTitle, PageSubtitle } from '../atoms/PageTitle';
import styled, { css } from 'styled-components';
import { BreadcrumbItem, Breadcrumbs } from '../atoms/Breadcrumbs';
import { Link, useLocation } from 'react-router-dom';
import { SearchBox } from '../atoms/SearchBox';
import { GridContainer } from '../atoms/Grid';

const HeaderBackground = styled.div`
  margin-bottom: 1em;
`;

const TabRow = styled.ul`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  background: #949494;
  width: 100%;
`;

const TabItem = styled.li<{ $active?: boolean }>`
  padding: 0.9em 1.5625rem;
  margin: 0 0.1em;
  font-size: 0.85em;
  color: #fff;
  text-decoration: none;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  ${props =>
    props.$active &&
    css`
      color: white;
      border-bottom: 2px white solid;
      &:hover {
        background: #fff;
      }
    `}
`;

const HeaderThumbnail = styled.div`
  padding: 1em 0;
  max-height: 150px;
  img {
    height: 100%;
    max-height: 100%;
    width: auto;
  }
`;

const HeaderGrid = styled.div`
  display: flex;
`;

const TitleContainer = styled.div`
  flex: 1 1 0px;
  margin-right: auto;
  background: #333;
`;

export const Header: React.FC<{
  title: any;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  menu?: BreadcrumbItem[];
  thumbnail?: string;
  search?: boolean;
  searchFunction?: (val: string) => void;
}> = ({ title, subtitle, breadcrumbs, menu, thumbnail, search = false, searchFunction }) => {
  const { pathname } = useLocation();
  return (
    <HeaderBackground>
      <HeaderGrid style={{ display: 'flex' }}>
        {thumbnail ? (
          <HeaderThumbnail>
            <img alt="thumbnail" src={thumbnail} />
          </HeaderThumbnail>
        ) : null}
        <TitleContainer>
          <GridContainer $justify={'space-between'}>
            <PageTitle subtitle={!!subtitle}>{title}</PageTitle>
            {search && searchFunction ? <SearchBox onSearch={val => searchFunction(val)} /> : null}
          </GridContainer>
          {subtitle ? <PageSubtitle>{subtitle}</PageSubtitle> : null}
        </TitleContainer>
      </HeaderGrid>
      {menu ? (
        <GridContainer $justify={'space-between'}>
          <TabRow>
            {menu.map((item, n) => (
              <TabItem
                key={item.link}
                $active={pathname === item.link || (pathname.indexOf(item.link) !== -1 && n > 0)}
                as={Link}
                to={item.link}
              >
                {item.label}
              </TabItem>
            ))}
          </TabRow>
        </GridContainer>
      ) : null}
      {breadcrumbs ? (
        <Breadcrumbs
          items={breadcrumbs}
          background="white"
          color="#007bff"
          $activeColor="black"
          padding="0.5rem 1.25rem"
        />
      ) : null}
    </HeaderBackground>
  );
};
