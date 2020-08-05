import React from 'react';
import { LocaleString } from '../../shared/components/LocaleString';
import { ProjectFull } from '../../../types/schemas/project-full';
import { Debug } from '../../shared/atoms/Debug';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../shared/atoms/Statistics';
import { SubtaskProgress } from '../../shared/atoms/SubtaskProgress';
import { Subheading1 } from '../../shared/atoms/Heading1';

// @todo create universal component and load up the main collection.
export const ViewProject: React.FC<{ project: ProjectFull }> = ({ project }) => {
  // List of collections - just filter the main collection
  // List of manifests - just filter the main collection
  // Contribution statistics - copy the backend
  // Review tasks - normal user query, need some nice presentation.
  // Current users tasks - same as above.

  return (
    <>
      <LocaleString as={'h1'}>{project.label}</LocaleString>
      <LocaleString as={Subheading1}>{project.summary}</LocaleString>
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
      <Debug>{project}</Debug>
    </>
  );
};
