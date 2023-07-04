import React from 'react';
import { ProjectStatus } from '../../shared/atoms/ProjectStatus';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { AvailableBlocks } from '../../shared/page-blocks/available-blocks';
import { Slot } from '../../shared/page-blocks/slot';
import { ProjectActions } from '../features/projectDash/ProjectActions';
import { ProjectContributors } from '../features/projectDash/ProjectContributors';
import { ProjectHeading } from '../features/projectDash/ProjectHeading';
import { ProjectStatistics } from '../features/projectDash/ProjectStatistics';
import { ProjectTabs } from '../features/projectDash/ProjectTabs';
import { SearchResource } from '../features/projectDash/SearchResource';

export const ViewProject: React.FC = () => {
  const available = (
    <AvailableBlocks>
      <ProjectContributors />
    </AvailableBlocks>
  );

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="project-heading">
        <ProjectStatus />
        <ProjectHeading />
        {available}
      </Slot>

      <Slot name="project-actionss">
        <SearchResource />
        <ProjectStatistics />
        <ProjectActions />
        {available}
      </Slot>

      <Slot name="project-navigation">
        <ProjectTabs />
        {available}
      </Slot>
    </>
  );
};
