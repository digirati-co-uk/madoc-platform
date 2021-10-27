import * as React from 'react';
import {
  Statistic,
  StatisticContainer,
  StatisticLabel,
  StatisticNumber,
} from '../../src/frontend/shared/atoms/Statistics';

export default { title: 'Legacy/Statistics' };

export const simpleList = () => {
  return (
    <StatisticContainer>
      <Statistic>
        <StatisticNumber>32</StatisticNumber>
        <StatisticLabel>Not started</StatisticLabel>
      </Statistic>
      <Statistic>
        <StatisticNumber>4</StatisticNumber>
        <StatisticLabel>In progress</StatisticLabel>
      </Statistic>
      <Statistic>
        <StatisticNumber>6</StatisticNumber>
        <StatisticLabel>In review</StatisticLabel>
      </Statistic>
      <Statistic>
        <StatisticNumber>7</StatisticNumber>
        <StatisticLabel>Completed</StatisticLabel>
      </Statistic>
    </StatisticContainer>
  );
};
