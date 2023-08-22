import * as React from 'react';
import { BaseField } from '../../../types/field-types';
import { Grid, GridColumn } from '../../atoms/Grid';
import { DocumentStore } from './document-store';
import { DocumentEditor } from '../../components/DocumentEditor/DocumentEditor';
import { FieldEditor } from '../../components/FieldEditor/FieldEditor';
import '../../input-types/TextField/index';

import model from '../../../../../../../fixtures/simple.json';

export default { title: 'Stores/Document Store' };
const Test: React.FC = () => {
  const state = DocumentStore.useStoreState(s => ({
    subtree: s.subtree,
    subtreePath: s.subtreePath,
    subtreeFields: s.subtreeFields,
    selectedField: s.selectedFieldKey,
  }));
  const actions = DocumentStore.useStoreActions(a => a);

  return (
    <Grid padded>
      <GridColumn>
        <DocumentEditor
          setSelector={actions.setSelector}
          selectField={actions.selectField}
          setDescription={actions.setDescription}
          setLabel={actions.setLabel}
          setLabelledBy={actions.setLabelledBy}
          setAllowMultiple={actions.setAllowMultiple}
          setRequired={actions.setRequired}
          setDependant={actions.setDependant}
          deselectField={actions.deselectField}
          popSubtree={actions.popSubtree}
          pushSubtree={actions.pushSubtree}
          subtree={state.subtree}
          subtreeFields={state.subtreeFields}
          selectedField={state.selectedField}
          subtreePath={state.subtreePath}
          addField={actions.addField}
          setPluralLabel={actions.setPluralLabel}
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
      </GridColumn>
      <GridColumn fluid>
        {state.selectedField ? (
          <div>
            <FieldEditor
              key={state.selectedField}
              term={state.selectedField}
              field={state.subtree.properties[state.selectedField][0] as BaseField}
              onChangeFieldType={(type, defaults) => {
                actions.setFieldType({
                  type,
                  defaults,
                });
                actions.deselectField();
                if (state.selectedField) {
                  actions.selectField(state.selectedField);
                }
              }}
              onSubmit={field => {
                actions.setField({ field });
                actions.setFieldSelector({ selector: field.selector });
                actions.deselectField();
              }}
              onDelete={() => {
                if (state.selectedField) {
                  actions.removeField(state.selectedField);
                  // removeStructureField({ term: state.selectedField });
                }
                actions.deselectField();
              }}
            />
          </div>
        ) : (
          <div>
            <div>No field selected</div>
          </div>
        )}
      </GridColumn>
    </Grid>
  );
};

export const Simple: React.FC = () => (
  <DocumentStore.Provider initialData={{ captureModel: model }}>
    <Test />
  </DocumentStore.Provider>
);
