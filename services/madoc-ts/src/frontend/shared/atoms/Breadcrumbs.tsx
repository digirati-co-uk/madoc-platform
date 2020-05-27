import styled, { css } from 'styled-components';
import React from 'react';
import { Link } from 'react-router-dom';

export type BreadcrumbItem = {
  label: string | any;
  link: string;
  active?: boolean;
};

const BreadcrumbContainer = styled.div`
  background: #4e82df;
  color: #fff;
  display: flex;
  padding: 0.5em 1.2em;
  font-size: 0.9em;
`;

const BreadcrumbItem = styled.div<{ active?: boolean }>`
  a {
    text-decoration: none;
    color: rgba(255, 255, 255, 0.7);
    &:hover {
      color: rgba(255, 255, 255, 1);
    }
    ${props =>
      props.active &&
      css`
        color: #fff;
      `}
  }
`;

const BreadcrumbSeparator = styled.div`
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0.6em;
`;

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <BreadcrumbContainer>
      {items.map((item, n) => {
        return (
          <>
            {n !== 0 ? <BreadcrumbSeparator>{`/`}</BreadcrumbSeparator> : null}
            <BreadcrumbItem key={item.link} active={item.active}>
              <Link to={item.link}>{item.label}</Link>
            </BreadcrumbItem>
          </>
        );
      })}
    </BreadcrumbContainer>
  );
};
