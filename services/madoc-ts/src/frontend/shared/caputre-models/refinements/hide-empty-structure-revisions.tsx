import { isEmptyRevision } from '@capture-models/helpers';
import { registerRefinement } from '@capture-models/plugin-api';
import React, { useMemo } from 'react';
import { RevisionList, RevisionListProps } from '../RevisionList';

const FilteredRevisionList: React.FC<RevisionListProps> = props => {
  const filteredRevisions = useMemo(
    () =>
      props.revisions.filter(
        revision => !(revision.source === 'canonical' && revision.revision.approved && isEmptyRevision(revision))
      ),
    [props.revisions]
  );

  return <RevisionList model={props.model} {...props} revisions={filteredRevisions} />;
};

registerRefinement({
  name: 'Hide empty structure revisions',
  type: 'revision-list',
  supports({ instance }, { revisions }) {
    for (const revision of revisions) {
      if (revision.source === 'canonical' && revision.revision.approved && isEmptyRevision(revision)) {
        return true;
      }
    }
    return false;
  },
  refine({ instance: model }, props) {
    return <FilteredRevisionList model={model} {...props} />;
  },
});
