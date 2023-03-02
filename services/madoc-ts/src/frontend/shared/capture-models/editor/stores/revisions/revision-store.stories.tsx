import * as React from 'react';
import { CaptureModel } from '../../../types/capture-model';
import { Revisions } from './';

import fixtures from '../../../../../../../fixtures/03-revisions/01-single-field-with-revision.json';

import fixtures0 from '../../../../../../../fixtures/03-revisions/02-single-field-with-multiple-revisions.json';

import fixtures01 from '../../../../../../../fixtures/03-revisions/03-nested-revision.json';

import fixtures012 from '../../../../../../../fixtures/03-revisions/04-dual-transcription.json';

import fixtures0123 from '../../../../../../../fixtures/03-revisions/05-allow-multiple-transcriptions.json';

import fixtures01234 from '../../../../../../../fixtures/04-selectors/01-simple-selector.json';

export default { title: 'Stores/Revision Store' };

const models: () => CaptureModel[] = () => [fixtures, fixtures0, fixtures01, fixtures012, fixtures0123, fixtures01234];

const Test: React.FC = () => {
  const state = Revisions.useStoreState(s => s);
  const actions = Revisions.useStoreActions(a => a);

  return (
    <div>
      <h3>Revision store</h3>
      {Object.values(state.revisions).map(revision => (
        <div>
          <h4>{revision.revision.label}</h4>
        </div>
      ))}
      <pre>
        {state.selector.availableSelectors.length ? (
          <button
            onClick={() => {
              actions.chooseSelector({
                selectorId: state.selector.availableSelectors[0].id,
              });
              actions.addVisibleSelectorIds({ selectorIds: [state.selector.availableSelectors[0].id] });
            }}
          >
            Choose first selector
          </button>
        ) : null}
        <button
          onClick={() => {
            actions.createRevision({
              revisionId: 'test-person-a',
              cloneMode: 'FORK_TEMPLATE',
            });
          }}
        >
          Create
        </button>
        <button
          onClick={() =>
            actions.selectRevision({
              revisionId: 'c2',
            })
          }
        >
          Select first
        </button>
        <button
          onClick={() =>
            actions.createNewFieldInstance({
              path: [],
              property: 'transcription',
            })
          }
        >
          New instance
        </button>
        <button
          onClick={() =>
            actions.updateFieldValue({
              path: [['transcription', 'f2']],
              value: 'testing this value',
            })
          }
        >
          Update
        </button>
        <code>{JSON.stringify(state, null, 2)}</code>
      </pre>
    </div>
  );
};

export const Simple: React.FC = () => (
  <Revisions.Provider initialData={{ captureModel: models()[4] }}>
    <Test />
  </Revisions.Provider>
);

export const WithSelector: React.FC = () => (
  <Revisions.Provider initialData={{ captureModel: models()[5] }}>
    <Test />
  </Revisions.Provider>
);
