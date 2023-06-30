import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { StatisticContainer, StatisticLabel, StatisticNumber } from '../../../shared/atoms/Statistics';
import { useProject } from '../../hooks/use-project';
import { useSiteConfiguration } from '../SiteConfigurationContext';
import styled from 'styled-components';
import { useProjectManifests } from '../../hooks/use-project-manifests';
import CheckCircleIcon from '../../../shared/icons/CheckCircleIcon';
import HourglassIcon from '../../../shared/icons/HourglassIcon';
import PendingIcon from '../../../shared/icons/PendingIcon';
import InProgressIcon from '../../../shared/icons/InProgressIcon';

const ProgessHeading = styled.h2`
  font-size: 1.2em;
  padding: 0 1em;
`;

const ContentStat = styled.div`
  background: #fff;
  text-align: center;
  border: 1px solid #d9d9d9;
  padding: 1em 2em;
  color: #333;
  width: 100%;
`;
const ContentStatNumber = styled.div`
  font-size: 2em;
  font-weight: 600;
`;
const ContentStatisticLabel = styled.div`
  font-size: 2em;
  font-weight: 300;
`;

const ProgressBar = styled.progress<{ $valueColour?: string; $barColour?: string }>`
  margin: 1em 0;
  width: 100%;
  height: 8px;
  border-radius: 0.5em;
  display: flex;
  overflow: hidden;
  appearance: none;
  background-color: ${props => (props.$barColour ? props.$barColour : '')};
  ::-webkit-progress-bar,
  ::-moz-progress-bar {
    background-color: ${props => (props.$valueColour ? props.$valueColour : '#47991b')};
  }
`;

const ProgressContainer = styled.div`
  margin: 0 auto;
  width: auto;
  padding: 2em;
`;

const ProjectStatisticContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const ProgressBars = styled.div`
  border: 1px solid #d9d9d9;
  display: flex;
  justify-content: space-evenly;
  padding: 1em;
  width: 100%;
  gap: 1em;
`;

const ProgressStat = styled.div`
  background: #fff;
  text-align: center;
  border: 1px solid #d9d9d9;
  padding: 1em 3em;
  width: 100%;
  color: #333;
`;
export const ProjectStatistics: React.FC = () => {
  const { data: project } = useProject();
  const { data: manifests } = useProjectManifests();

  const { t } = useTranslation();
  const {
    project: { hideStatistics },
  } = useSiteConfiguration();

  const completedReviewTotal = Math.max(0, project?.statistics['2'] || 0) + Math.max(0, project?.statistics['3'] || 0);
  const progressNotStartedTotal =
    Math.max(0, project?.statistics['0'] || 0) + Math.max(0, project?.statistics['1'] || 0);

  if (hideStatistics || !project) {
    return null;
  }

  return (
    <div style={{ width: '75vw' }}>
      <ProgessHeading>{t('Project progress')}</ProgessHeading>
      <StatisticContainer>
        <ContentStat>
          <ContentStatNumber>{project.content.manifests}</ContentStatNumber>
          <ContentStatisticLabel>{t('Manifests')}</ContentStatisticLabel>
          <ProgressBar value={manifests?.subjects?.length} max={project.content.manifests} />
        </ContentStat>
        <ContentStat>
          <ContentStatNumber>{project.content.canvases}</ContentStatNumber>
          <ContentStatisticLabel>{t('Canvases')}</ContentStatisticLabel>
          <ProgressBar value={12} max={project.content.canvases} />
        </ContentStat>
        <ContentStat>
          <ContentStatNumber>??</ContentStatNumber>
          <ContentStatisticLabel>{t('Collections')}</ContentStatisticLabel>
          <ProgressBar value={0} max={0} />
        </ContentStat>
      </StatisticContainer>

      <ProgressContainer>
        <ProgressBars>
          <ProgressBar
            $valueColour="#47991B"
            $barColour="#378BC2"
            value={project.statistics['3']}
            max={completedReviewTotal}
          />
          <ProgressBar
            $valueColour="#FFC63F"
            $barColour="#d9d9d9"
            value={project.statistics['1']}
            max={progressNotStartedTotal}
          />
        </ProgressBars>
        <ProjectStatisticContainer>
          <ProgressStat style={{ borderTop: '4px solid #47991B' }}>
            <StatisticNumber>
              <CheckCircleIcon />
              {Math.max(0, project.statistics['0'] || 0)}
            </StatisticNumber>
            <StatisticLabel>{t('Not started')}</StatisticLabel>
          </ProgressStat>

          <ProgressStat style={{ borderTop: '4px solid #378BC2' }}>
            <StatisticNumber>
              <HourglassIcon />
              {Math.max(0, project.statistics['2'] || 0)}
            </StatisticNumber>
            <StatisticLabel>{t('In review')}</StatisticLabel>
          </ProgressStat>

          <ProgressStat style={{ borderTop: '4px solid #FFC63F' }}>
            <StatisticNumber>
              <InProgressIcon />
              {Math.max(0, project.statistics['1'] || 0)}
            </StatisticNumber>
            <StatisticLabel>{t('In progress')}</StatisticLabel>
          </ProgressStat>

          <ProgressStat style={{ borderTop: '4px solid #d9d9d9' }}>
            <StatisticNumber>
              <PendingIcon />
              {Math.max(0, project.statistics['3'] || 0)}
            </StatisticNumber>
            <StatisticLabel>{t('Completed')}</StatisticLabel>
          </ProgressStat>
        </ProjectStatisticContainer>
      </ProgressContainer>
    </div>
  );
};

blockEditorFor(ProjectStatistics, {
  type: 'default.ProjectStatistics',
  label: 'Project statistics',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});
