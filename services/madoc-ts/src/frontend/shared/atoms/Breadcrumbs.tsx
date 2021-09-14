import styled, { css } from 'styled-components';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BreadcrumbDivider, BreadcrumbList, BreadcrumbItem as SiteBreadcrumbItem } from '../components/Breadcrumbs';
import { useSite } from '../hooks/use-site';

export type BreadcrumbItem = {
  label: string | any;
  link: string;
  active?: boolean;
};

export const BreadcrumbContainer = styled.div<{ background?: string; color?: string; padding?: string }>`
  background: ${props => (props.background ? props.background : `#485C9B`)};
  color: ${props => (props.color ? props.color : `#fff`)};
  display: flex;
  padding: ${props => (props.padding ? props.padding : `0.5em 1.2em`)};
  font-size: 0.9em;
`;

export const BreadcrumbItem = styled.div<{ active?: boolean; color?: string; $activeColor?: string }>`
  a {
    text-decoration: none;
    color: ${props => (props.color ? props.color : `rgba(255, 255, 255, 0.7)`)};
    max-width: 200px;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    &:hover {
      color: ${props => (props.color ? 'black' : `rgba(255, 255, 255, 1)`)};
    }
    ${props =>
      props.active &&
      props.$activeColor &&
      css`
        color: ${props.$activeColor ? props.$activeColor : `#fff`};
      `}
  }
`;

export const BreadcrumbSeparator = styled.div<{ color?: string }>`
  color: ${props => (props.color ? props.color : `rgba(255, 255, 255, 0.7)`)};
  margin: 0 0.6em;
`;

export const Breadcrumbs: React.FC<{
  items: Array<BreadcrumbItem | undefined>;
  type?: 'site';
  background?: string;
  color?: string;
  $activeColor?: string;
  padding?: string;
}> = ({ items: rawItems, type, background, color, $activeColor, padding }) => {
  const items: BreadcrumbItem[] = useMemo(() => rawItems.filter(r => r) as BreadcrumbItem[], [rawItems]);
  const site = useSite();

  if (items.length === 0) {
    return null;
  }

  if (type === 'site') {
    return (
      <BreadcrumbList>
        {items.map((s, n) => (
          <React.Fragment key={s.link}>
            <SiteBreadcrumbItem active={s.active}>
              {s.active ? s.label : <Link to={s.link}>{s.label}</Link>}
            </SiteBreadcrumbItem>
            {n < items.length - 1 ? <BreadcrumbDivider /> : null}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    );
  }

  return (
    <BreadcrumbContainer background={background} color={color} padding={padding}>
      <BreadcrumbItem active>
        <a style={{ color: '#fff' }} href={`/s/${site.slug}`}>
          Back to site
        </a>
      </BreadcrumbItem>
      <BreadcrumbSeparator color={color}>{`/`}</BreadcrumbSeparator>
      {items.map((item, n) => {
        return (
          <React.Fragment key={item.link}>
            {n !== 0 ? <BreadcrumbSeparator color={color}>{`/`}</BreadcrumbSeparator> : null}
            <BreadcrumbItem key={item.link} active={item.active} color={color} $activeColor={$activeColor}>
              <Link to={item.link} title={item.label}>
                {item.label}
              </Link>
            </BreadcrumbItem>
          </React.Fragment>
        );
      })}
    </BreadcrumbContainer>
  );
};
