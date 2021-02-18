import React from 'react';
import { useTranslation } from 'react-i18next';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../shared/atoms/Statistics';
import { useUserHomepage } from '../hooks/use-user-homepage';

export const UserStatistics: React.FC = () => {
  const { data } = useUserHomepage();
  const { t } = useTranslation();

  if (!data) {
    return null;
  }

  const userDetails = data.userDetails;

  return (
    <div>
      <StatisticContainer>
        <Statistic>
          <StatisticNumber>{0}</StatisticNumber>
          <StatisticLabel>{t('Bookmarks')}</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{userDetails.statistics.statuses['3'] || 0}</StatisticNumber>
          <StatisticLabel>{t('Accepted contributions')}</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{userDetails.statistics.total}</StatisticNumber>
          <StatisticLabel>{t('Total contributions')}</StatisticLabel>
        </Statistic>
      </StatisticContainer>
    </div>
  );
};
