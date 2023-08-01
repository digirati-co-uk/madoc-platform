import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { StatisticLabel, StatisticNumber, StatisticText } from '../../shared/atoms/Statistics';
import { useProject } from '../hooks/use-project';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import styled from 'styled-components';
import CheckCircleIcon from '../../shared/icons/CheckCircleIcon';
import HourglassIcon from '../../shared/icons/HourglassIcon';
import PendingIcon from '../../shared/icons/PendingIcon';
import InProgressIcon from '../../shared/icons/InProgressIcon';

const ProgressHeading = styled.h2`
  font-size: 1.2em;
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
`;

const ProgressStat = styled.div`
  background: #fff;
  display: flex;
  gap: 1em;
  align-items: center;
  justify-content: space-around;
  text-align: center;
  border: 1px solid #999;
  padding: 1em;
  margin: 1em;

  svg {
    font-size: 40px;
    fill: #999;
  }
`;

export const ProjectStatistics: React.FC = () => {
  const { data: project } = useProject();
  const { t } = useTranslation();
  const {
    project: { hideStatistics },
  } = useSiteConfiguration();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const total = Object.values(project?.statistics || {}).reduce((a, b) => Math.max(a, 0) + Math.max(b, 0), 0);

  if (hideStatistics || !project) {
    return null;
  }

  return (
    <>
      <ProgressContainer>
        <ProgressStat style={{ borderTop: '2px solid #B05104' }}>
          <CheckCircleIcon />
          <StatisticText>
            <StatisticNumber>{Math.max(0, project.statistics['0'] || 0)}</StatisticNumber>
            <StatisticLabel>{t('Not started')}</StatisticLabel>
            <StatisticLabel style={{ color: '#6B6B6B' }}>
              {Math.round((Math.max(0, project.statistics['0'] || 0) / total) * 100)}%
            </StatisticLabel>
          </StatisticText>
        </ProgressStat>

        <ProgressStat style={{ borderTop: '2px solid #B08D04' }}>
          <HourglassIcon />
          <StatisticText>
            <StatisticNumber>{Math.max(0, project.statistics['2'] || 0)}</StatisticNumber>
            <StatisticLabel>{t('In review')}</StatisticLabel>
            <StatisticLabel style={{ color: '#6B6B6B' }}>
              {Math.round((Math.max(0, project.statistics['2'] || 0) / total) * 100)}%
            </StatisticLabel>
          </StatisticText>
        </ProgressStat>

        <ProgressStat style={{ borderTop: '2px solid #00D1B8' }}>
          <InProgressIcon />
          <StatisticText>
            <StatisticNumber>{Math.max(0, project.statistics['1'] || 0)}</StatisticNumber>
            <StatisticLabel>{t('In progress')}</StatisticLabel>
            <StatisticLabel style={{ color: '#6B6B6B' }}>
              {Math.round((Math.max(0, project.statistics['1'] || 0) / total) * 100)}%
            </StatisticLabel>
          </StatisticText>
        </ProgressStat>

        <ProgressStat style={{ borderTop: '2px solid #2BA30D' }}>
          <PendingIcon />
          <StatisticText>
            <StatisticNumber>{Math.max(0, project.statistics['3'] || 0)}</StatisticNumber>
            <StatisticLabel>{t('Completed')}</StatisticLabel>
            <StatisticLabel style={{ color: '#6B6B6B' }}>
              {Math.round((Math.max(0, project.statistics['3'] || 0) / total) * 100)}%
            </StatisticLabel>
          </StatisticText>
        </ProgressStat>
      </ProgressContainer>
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
