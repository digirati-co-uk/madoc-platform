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
      <Button disabled={isLoading} onClick={() => indexContext()}>
        Index all manifests {isLoading ? ` ${percent}%` : null}
      </Button>
    </div>
  );
};
