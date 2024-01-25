import React from 'react';
import { Button } from '../../../../shared/navigation/Button';
import { useData } from '../../../../shared/hooks/use-data';
import { useIndexResources } from '../../../hooks/use-index-resource';
import { ProjectContent } from './project-content';

export const ProjectSearchIndex = () => {
  const { data: structure } = useData(ProjectContent);
  const [indexContext, { isLoading, percent }] = useIndexResources(structure?.items || []);

  return (
    <div>
      <p>Index manifests in the project search to:</p>
      <ul>
        <li>Add all current manifests in this project to the project search</li>
        <li>and/or delete manifests that have been deleted from this project from the project search.</li>
      </ul>
      <p>
        This process may take some time, and will be run in the background. Once pressed you can navigate away from this
        page.
      </p>
      <Button disabled={isLoading} onClick={() => indexContext()}>
        Index all manifests {isLoading ? ` ${percent}%` : null}
      </Button>
    </div>
  );
};
