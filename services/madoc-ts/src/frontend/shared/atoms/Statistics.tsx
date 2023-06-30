import styled, { css } from 'styled-components';
import React from 'react';
import { Link } from 'react-router-dom';

export const StatisticLabel = styled.div`
  font-size: 0.9em;
  color: black;
`;

export const StatisticNumber = styled.div`
  font-size: 2em;
  font-weight: 600;

  > svg {
    font-size: 48px;
    vertical-align: -10px;
    fill: #999999;
  }
`;

export const Statistic = styled.div<{ $interactive?: boolean }>`
  margin: 1em;
  border-radius: 5px;
  background: #fff;
  text-align: center;
  border: 2px solid ${props => (props.$interactive ? '#4265e9' : '#CCC')};
  padding: 1.25em 2em;
  color: #333;

  ${props =>
    props.$interactive &&
    css`
      &:hover {
        background-color: #4265e9;
        color: #fff;
      }
    `}
`;

const linkStyle = {
  display: 'block',
  padding: '1.25em 2em',
  textDecoration: 'none',
  color: 'unset',
};

export const StatisticLink: React.FC<any> = ({ to, number, label, cypressCountLabel }) => {
  return (
    <Statistic style={{ padding: '0' }}>
      <Link to={to} style={linkStyle}>
        <StatisticNumber data-cy={cypressCountLabel}>{number}</StatisticNumber>
        <StatisticLabel>{label}</StatisticLabel>
      </Link>
    </Statistic>
  );
};

export const StatisticContainer = styled.div`
  display: flex;
  margin: 0 auto;
  width: auto;
  align-items: center;
  justify-content: center;
  padding: 2em;
`;
