import React from 'react';
import { Button } from '../../../../shared/atoms/Button';
import { useData } from '../../../../shared/hooks/use-data';
import { useIndexResources } from '../../../hooks/use-index-resource';
import { EditCollectionStructure } from './edit-collection-structure';

export const CollectionSearchIndex = () => {
  const { data: structure } = useData(EditCollectionStructure);
  const [indexContext, { isLoading, percent }] = useIndexResources(structure?.items || []);

  return (
    <div>
      <Button disabled={isLoading} onClick={() => indexContext()}>
        Index all manifests {isLoading ? ` ${percent}%` : null}
      </Button>
    </div>
  );
};
