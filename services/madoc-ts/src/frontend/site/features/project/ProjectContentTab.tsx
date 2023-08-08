import React from 'react';
import { useTranslation } from 'react-i18next';
import { Slot } from '../../../shared/page-blocks/slot';
import { ProjectCollections } from '../../blocks/ProjectCollections';
import { ProjectManifests } from '../../blocks/ProjectManifests';

export const ProjectContentTab: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Slot name="content-tab">
      <ProjectCollections />
      <ProjectManifests />
    </Slot>
  );
};
