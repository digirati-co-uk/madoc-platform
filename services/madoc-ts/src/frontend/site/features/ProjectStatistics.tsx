import React from 'react';
import { useTranslation } from 'react-i18next';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../shared/atoms/Statistics';
import { SubtaskProgress } from '../../shared/atoms/SubtaskProgress';
import { useStaticData } from '../../shared/hooks/use-data';
import { ProjectLoader } from '../pages/loaders/project-loader';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const ProjectStatistics: React.FC = () => {
  const { data: project } = useStaticData(ProjectLoader);
  const { t } = useTranslation();
  const {
    project: { hideStatistics },
  } = useSiteConfiguration();

  if (hideStatistics || !project) {
    return null;
  }

  return (
    <>
      <StatisticContainer>
        <Statistic>
          <StatisticNumber>{project.statistics['0'] || 0}</StatisticNumber>
          <StatisticLabel>{t('Not started')}</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{project.statistics['1'] || 0}</StatisticNumber>
          <StatisticLabel>{t('In progress')}</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{project.statistics['2'] || 0}</StatisticNumber>
          <StatisticLabel>{t('In review')}</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{project.statistics['3'] || 0}</StatisticNumber>
          <StatisticLabel>{t('Completed')}</StatisticLabel>
        </Statistic>
      </StatisticContainer>
      <SubtaskProgress
        total={project.statistics['0'] + project.statistics['1'] + project.statistics['2'] + project.statistics['3']}
        done={project.statistics['3'] || 0}
        progress={(project.statistics['2'] || 0) + (project.statistics['1'] || 0)}
      />
    </>
  );
};
