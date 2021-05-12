import React from 'react';
import { useMutation } from 'react-query';
import { Button, ButtonRow } from '../../../../shared/atoms/Button';
import { SubtaskProgress } from '../../../../shared/atoms/SubtaskProgress';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../../../shared/atoms/Statistics';
import { ProjectFull } from '../../../../../types/schemas/project-full';
import { useApi } from '../../../../shared/hooks/use-api';

export const ProjectOverview: React.FC<{ project: ProjectFull; refetch: () => Promise<void> }> = ({
  project,
  refetch,
}) => {
  const api = useApi();

  const [updateStatus, { isLoading }] = useMutation(async (newStatus: number) => {
    await api.updateProjectStatus(project.id, newStatus);
    await refetch();
  });

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

      <ButtonRow>
        <Button
          $success={project.status === 0}
          disabled={isLoading || project.status === 0}
          onClick={() => updateStatus(0)}
        >
          Pause project
        </Button>
        <Button
          $success={project.status === 1}
          disabled={isLoading || project.status === 1}
          onClick={() => updateStatus(1)}
        >
          Resume project
        </Button>
        <Button
          $success={project.status === 2}
          disabled={isLoading || project.status === 2}
          onClick={() => updateStatus(2)}
        >
          Mark as complete
        </Button>
        <Button
          $success={project.status === 3}
          disabled={isLoading || project.status === 3}
          onClick={() => updateStatus(3)}
        >
          Archive project
        </Button>
        <Button
          $success={project.status === 4}
          disabled={isLoading || project.status === 4}
          onClick={() => updateStatus(4)}
        >
          Prepare project
        </Button>
      </ButtonRow>
    </div>
  );
};
