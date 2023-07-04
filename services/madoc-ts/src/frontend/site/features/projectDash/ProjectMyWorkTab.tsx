import React from 'react';
import { ProjectContributionButton } from '../contributor/ProjectContributionButton';
import { Slot } from '../../../shared/page-blocks/slot';
import { ContributorTasks } from '../contributor/ContributorTasks';

export const ProjectMyWorkTab: React.FC = () => {
  return (
    <Slot name="my-work-tab-1">
      <ProjectContributionButton />
      <ContributorTasks />
    </Slot>
  );
};
