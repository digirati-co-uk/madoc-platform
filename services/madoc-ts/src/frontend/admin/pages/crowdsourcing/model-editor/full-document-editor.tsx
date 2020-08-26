import React from 'react';
import {
  DocumentEditor,
  DocumentStore,
  FieldEditor,
  FieldWrapper,
  Segment,
  StructureStore,
} from '@capture-models/editor';
import { BaseField } from '@capture-models/types';
import { Header } from '../../../../shared/atoms/Header';
import { isEntityList } from '@capture-models/helpers';
import { useApi } from '../../../../shared/hooks/use-api';

export const FullDocumentEditor: React.FC = () => {
  const api = useApi();
  const store = DocumentStore.useStore();
  const state = DocumentStore.useStoreState(s => ({
    subtree: s.subtree,
    subtreePath: s.subtreePath,
    subtreeFields: s.subtreeFields,
    selectedField: s.selectedFieldKey,
  }));
  const actions = DocumentStore.useStoreActions(a => a);
  const removeStructureField = StructureStore.useStoreActions(a => a.removeField);

  return (
    <div style={{ display: 'flex', fontSize: 14 }}>
      <div style={{ width: '40%', margin: 20 }}>
        <DocumentEditor
          selectField={actions.selectField}
          setDescription={actions.setDescription}
          setLabel={actions.setLabel}
          setAllowMultiple={actions.setAllowMultiple}
          setLabelledBy={actions.setLabelledBy}
          setPluralLabel={actions.setPluralLabel}
          deselectField={actions.deselectField}
          popSubtree={actions.popSubtree}
          pushSubtree={actions.pushSubtree}
          subtree={state.subtree}
          subtreeFields={state.subtreeFields}
          selectedField={state.selectedField}
          subtreePath={state.subtreePath}
          addField={actions.addField}
          setSelector={actions.setSelector}
        />
      </div>
      <div style={{ width: '60%', margin: 20 }}>
        {state.selectedField ? (
          <div>
            <FieldEditor
              key={state.selectedField}
              term={state.selectedField}
              field={state.subtree.properties[state.selectedField][0] as BaseField}
              onChangeFieldType={(type, defaults, term) => {
                const subtreePath = state.subtreePath;
                actions.setFieldType({
                  type,
                  defaults,
                  term,
                  subtreePath,
                });
                actions.deselectField();
                const termToUse = term ? term : state.selectedField;
                if (termToUse) {
                  actions.selectField(termToUse);
                }
              }}
              onSubmit={(field, term) => {
                const subtreePath = state.subtreePath;
                const freshState = store.getState();
                actions.setField({ field, term, subtreePath });
                actions.setFieldSelector({ selector: field.selector, term, subtreePath });
                if (freshState.selectedFieldKey === term) {
                  actions.deselectField();
                }
              }}
              onDelete={term => {
                const termToDelete = term ? term : state.selectedField;
                if (termToDelete) {
                  actions.removeField(termToDelete);
                  removeStructureField({ term: termToDelete });
                }
                actions.deselectField();
              }}
            />
          </div>
        ) : (
          <div>
            <Header>No field selected</Header>
            <Segment>
              <h3 style={{ textAlign: 'center' }}>Preview (no entities)</h3>
              {!api.getIsServer() &&
                Object.keys(state.subtree.properties).map(term => {
                  const fields = state.subtree.properties[term];
                  if (isEntityList(fields)) {
                    return null;
                  }
                  try {
                    const field = fields[0];
                    return <FieldWrapper key={term} field={field as any} onUpdateValue={() => void 0} />;
                  } catch (err) {
                    return null;
                  }
                })}
            </Segment>
          </div>
        )}
      </div>
    </div>
  );
};
