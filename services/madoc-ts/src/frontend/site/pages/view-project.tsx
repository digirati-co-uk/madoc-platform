import React from 'react';
import { ProjectStatus } from '../../shared/atoms/ProjectStatus';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Slot } from '../../shared/page-blocks/slot';
import { ProjectActions } from '../features/ProjectActions';
import { ProjectContributionButton } from '../features/ProjectContributionButton';
import { ProjectCollections } from '../features/ProjectCollections';
import { ProjectHeading } from '../features/ProjectHeading';
import { ProjectManifests } from '../features/ProjectManifests';
import { ProjectStatistics } from '../features/ProjectStatistics';

export const ViewProject: React.FC = () => {
  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="project-heading">
        <ProjectStatus />
        <ProjectHeading />
      </Slot>

      <Slot name="project-actions">
        <ProjectActions />
        <ProjectContributionButton />
        <ProjectStatistics />
      </Slot>

      <Slot name="project-navigation">
        <ProjectCollections />
        <ProjectManifests />
      </Slot>

      <Slot name="project-footer" />
    </>
  );
};
