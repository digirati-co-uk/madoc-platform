import React from 'react';
import { RoundedCard } from './editor/components/RoundedCard/RoundedCard';
import { EntityTopLevel } from './EntityTopLevel';
import { RevisionRequest } from './types/revision-request';

type SingleRevisionProps = {
  request: RevisionRequest;
  unsavedIds: string[];
  selectRevision: (payload: { revisionId: string; readMode: boolean }) => void;
};

export const SingleRevision: React.FC<SingleRevisionProps> = ({ request, selectRevision, unsavedIds }) => {
  return (
    <RoundedCard
      label={request.revision.label || request.revision.id}
      interactive
      onClick={() => selectRevision({ revisionId: request.revision.id, readMode: request.revision.approved || false })}
    >
      {request.author ? (
        <div>
          Created by: <strong>{request.author.name}</strong>
        </div>
      ) : null}
      {unsavedIds.indexOf(request.revision.id) !== -1 ? 'UNSAVED' : ''}
      <div>{request.revision.approved ? 'Approved' : ''}</div>
      {request.revision.status ? (
        <div>
          Status: <strong>{request.revision.status}</strong>
        </div>
      ) : null}
      <EntityTopLevel
        setSelectedField={() => null}
        setSelectedEntity={() => null}
        path={[]}
        entity={{ instance: request.document, property: 'root' }}
        readOnly={true}
        hideSplash={true}
        hideCard={true}
      />
    </RoundedCard>
  );
};
