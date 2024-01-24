import React from 'react';
import { Button } from '../../../../shared/navigation/Button';
import { useData } from '../../../../shared/hooks/use-data';
import { useIndexResources } from '../../../hooks/use-index-resource';
import { EditCollectionStructure } from './edit-collection-structure';

export const CollectionSearchIndex = () => {
  const { data: structure } = useData(EditCollectionStructure);
  const [indexContext, { isLoading, percent }] = useIndexResources(structure?.items || []);

  return (
    <div>
      <p>Index manifests in the collection search index to:</p>
      <ul>
        <li>Add all manifests in this collection to the collection search</li>
        <li> and/or delete manifests that have been deleted from this collection from the collection search.</li>
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
