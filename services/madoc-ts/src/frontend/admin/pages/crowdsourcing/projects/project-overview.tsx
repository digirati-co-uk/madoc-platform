import { ProjectListItem } from '../../../../../types/schemas/project-list-item';
import React from 'react';
import { SubtaskProgress } from '../../../../shared/atoms/SubtaskProgress';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../../../shared/atoms/Statistics';

export const ProjectOverview: React.FC<{ project: ProjectListItem }> = ({ project }) => {
  return (
    <div>
      <StatisticContainer>
        <Statistic>
          <StatisticNumber>{project.statistics['0'] || 0}</StatisticNumber>
          <StatisticLabel>Not started</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{project.statistics['1'] || 0}</StatisticNumber>
          <StatisticLabel>In progress</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{project.statistics['2'] || 0}</StatisticNumber>
          <StatisticLabel>In review</StatisticLabel>
        </Statistic>
        <Statistic>
          <StatisticNumber>{project.statistics['3'] || 0}</StatisticNumber>
          <StatisticLabel>Completed</StatisticLabel>
        </Statistic>
      </StatisticContainer>
      <SubtaskProgress
        total={project.statistics['0'] + project.statistics['1'] + project.statistics['2'] + project.statistics['3']}
        done={project.statistics['3'] || 0}
        progress={(project.statistics['2'] || 0) + (project.statistics['1'] || 0)}
      />
    </div>
  );
};
