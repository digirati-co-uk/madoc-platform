import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../shared/atoms/Statistics';
import { SubtaskProgress } from '../../shared/atoms/SubtaskProgress';
import { useProject } from '../hooks/use-project';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const ProjectStatistics: React.FC = () => {
  const { data: project } = useProject();
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
          <StatisticNumber>{Math.max(0, project.statistics['0'] || 0)}</StatisticNumber>
          <StatisticLabel>{t('Not started')}</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{Math.max(0, project.statistics['1'] || 0)}</StatisticNumber>
          <StatisticLabel>{t('In progress')}</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{Math.max(0, project.statistics['2'] || 0)}</StatisticNumber>
          <StatisticLabel>{t('In review')}</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{Math.max(0, project.statistics['3'] || 0)}</StatisticNumber>
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

blockEditorFor(ProjectStatistics, {
  type: 'default.ProjectStatistics',
  label: 'Project statistics',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});
