import React from 'react';
import { useMutation } from 'react-query';
import { Button, ButtonRow } from '../../../../shared/atoms/Button';
import { ProjectStatus } from '../../../../shared/atoms/ProjectStatus';
import { SubtaskProgress } from '../../../../shared/atoms/SubtaskProgress';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../../../shared/atoms/Statistics';
import { ProjectFull } from '../../../../../types/schemas/project-full';
import { useApi } from '../../../../shared/hooks/use-api';
import { useProjectTemplate } from '../../../../shared/hooks/use-project-template';

export const ProjectOverview: React.FC<{ project: ProjectFull; refetch: () => Promise<void> }> = ({
  project,
  refetch,
}) => {
  const api = useApi();
  const template = useProjectTemplate(project?.template);
  const [updateStatus, { isLoading }] = useMutation(async (newStatus: number) => {
    await api.updateProjectStatus(project.id, newStatus);
    await refetch();
  });
  const statusMapping = template?.configuration?.status?.statusMap || {};
  const statusHidden = template?.configuration?.status?.disabled;

  return (
    <div>
      {!statusHidden ? <ProjectStatus status={project.status} statusMapping={statusMapping} /> : null}
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

      {!statusHidden ? (
        <ButtonRow>
          <Button
            $success={project.status === 4}
            disabled={isLoading || project.status === 4}
            onClick={() => updateStatus(4)}
          >
            {statusMapping[4] && statusMapping[4].action ? statusMapping[4].action : 'Prepare project'}
          </Button>
          <Button
            $success={project.status === 0}
            disabled={isLoading || project.status === 0}
            onClick={() => updateStatus(0)}
          >
            {statusMapping[0] && statusMapping[0].action ? statusMapping[0].action : 'Pause project'}
          </Button>
          <Button
            $success={project.status === 1}
            disabled={isLoading || project.status === 1}
            onClick={() => updateStatus(1)}
          >
            {statusMapping[1] && statusMapping[1].action ? statusMapping[1].action : 'Resume project'}
          </Button>
          <Button
            $success={project.status === 2}
            disabled={isLoading || project.status === 2}
            onClick={() => updateStatus(2)}
          >
            {statusMapping[2] && statusMapping[2].action ? statusMapping[2].action : 'Mark as complete'}
          </Button>
          <Button
            $success={project.status === 3}
            disabled={isLoading || project.status === 3}
            onClick={() => updateStatus(3)}
          >
            {statusMapping[3] && statusMapping[3].action ? statusMapping[3].action : 'Archive project'}
          </Button>
        </ButtonRow>
      ) : null}
    </div>
  );
};
