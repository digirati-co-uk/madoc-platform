import { ProjectListing } from '../atoms/ProjectListing';
import React from 'react';
import { useManifestProjects } from '../hooks/use-manifest-projects';

export const ManifestProjectListing: React.FC<{
  manifestId: string | number;
  onContribute: (id: string | number) => void;
}> = ({ manifestId, onContribute }) => {
  const projects = useManifestProjects(manifestId);
  const hasProjects = projects.data && projects.data.projects.length;

  if (!hasProjects || !projects.data) {
    return null;
  }

  return <ProjectListing projects={projects.data.projects} onContribute={onContribute} />;
};
