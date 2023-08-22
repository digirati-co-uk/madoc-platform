import React, { useMemo } from 'react';
import { Header } from '../../../../shared/atoms/Header';
import { Segment } from '../../../../shared/capture-models/editor/atoms/Segment';
import { DocumentEditor } from '../../../../shared/capture-models/editor/components/DocumentEditor/DocumentEditor';
import { FieldEditor } from '../../../../shared/capture-models/editor/components/FieldEditor/FieldEditor';
import { FieldWrapper } from '../../../../shared/capture-models/editor/components/FieldWrapper/FieldWrapper';
import { DocumentStore } from '../../../../shared/capture-models/editor/stores/document/document-store';
import { StructureStore } from '../../../../shared/capture-models/editor/stores/structure/structure-store';
import { isEntityList } from '../../../../shared/capture-models/helpers/is-entity';
import { BaseField } from '../../../../shared/capture-models/types/field-types';
import { useApi } from '../../../../shared/hooks/use-api';
import { useModelEditorConfig } from './use-model-editor-config';

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
  const sourceTypes = useMemo(() => {
    return api.getCaptureModelDataSources().map(source => source.definition);
  }, [api]);
  const { preventChangeDocument } = useModelEditorConfig();

  if (preventChangeDocument) {
    return null;
  }

  return (
    <div style={{ display: 'flex', fontSize: 14 }}>
      <div style={{ width: '40%', margin: 20 }}>
        <DocumentEditor
          selectField={actions.selectField}
          setDescription={actions.setDescription}
          setLabel={actions.setLabel}
          setAllowMultiple={actions.setAllowMultiple}
          setRequired={actions.setRequired}
          setDependant={actions.setDependant}
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
          onDelete={
            state.subtreePath.length !== 0
              ? () => {
                  const term = state.subtreePath.pop();
                  if (term) {
                    actions.popSubtree({ count: 1 });
                    actions.removeField(term);
                  }
                }
              : undefined
          }
        />
      </div>
      <div style={{ width: '60%', margin: 20 }}>
        {state.selectedField ? (
          <div>
            <FieldEditor
              sourceTypes={sourceTypes}
              subtreeFields={state.subtreeFields}
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
