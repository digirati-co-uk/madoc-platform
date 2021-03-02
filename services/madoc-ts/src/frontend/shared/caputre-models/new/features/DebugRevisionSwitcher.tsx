import { CaptureModel } from '@capture-models/types';
import React from 'react';
import { Revisions } from '@capture-models/editor';

export const DebugRevisionSwitcher: React.FC<{ contributors: CaptureModel['contributors'] }> = ({
  contributors = {},
}) => {
  const revisions = Revisions.useStoreState(s => s.revisions);
  const changeRevision = Revisions.useStoreActions(a => a.selectRevision);
  const ids = Object.keys(revisions);

  return (
    <div>
      <h3>Revision switcher</h3>
      <ul>
        {ids.map(id => {
          const rev = revisions[id];

          if (rev.source === 'canonical') {
            return null;
          }

          if (!rev.revision.authors) {
            return null;
          }

          return (
            <li key={id}>
              {(rev.revision.authors || []).map(auth => {
                return contributors[auth].name;
              })}
              {rev.revision.approved ? null : (
                <button onClick={() => changeRevision({ revisionId: id })}>Switch</button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
