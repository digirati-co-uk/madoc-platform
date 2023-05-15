import * as React from 'react';
import { CaptureModel } from '../../../types/capture-model';
import { DocumentEditor } from './DocumentEditor';
import { DocumentStore } from '../../stores/document/document-store';

import model from '../../../../../../../fixtures/simple.json';

export default {
  title: 'Capture model editor components/Document editor',
  component: DocumentEditor,
};

const Inner = () => {
  const state = DocumentStore.useStoreState(s => ({
    subtree: s.subtree,
    subtreePath: s.subtreePath,
    subtreeFields: s.subtreeFields,
  }));
  const actions = DocumentStore.useStoreActions(a => ({
    setLabel: a.setLabel,
    setDescription: a.setDescription,
    popSubtree: a.popSubtree,
    pushSubtree: a.pushSubtree,
    selectField: a.selectField,
    deselectField: a.deselectField,
    addField: a.addField,
    setSelector: a.setSelector,
    setAllowMultiple: a.setAllowMultiple,
    setRequired: a.setRequired,
    setLabelledBy: a.setLabelledBy,
    setPluralLabel: a.setPluralLabel,
  }));

  return (
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <DocumentEditor
        setSelector={actions.setSelector}
        selectField={actions.selectField}
        deselectField={actions.deselectField}
        setDescription={actions.setDescription}
        setLabel={actions.setLabel}
        setAllowMultiple={actions.setAllowMultiple}
        setRequired={actions.setRequired}
        setLabelledBy={actions.setLabelledBy}
        setPluralLabel={actions.setPluralLabel}
        popSubtree={actions.popSubtree}
        pushSubtree={actions.pushSubtree}
        subtree={state.subtree}
        subtreeFields={state.subtreeFields}
        subtreePath={state.subtreePath}
        addField={actions.addField}
      />
    </div>
  );
};

export const Simple: React.FC = () => {
  return (
    <DocumentStore.Provider initialData={{ captureModel: model }}>
      <Inner />
    </DocumentStore.Provider>
  );
};
