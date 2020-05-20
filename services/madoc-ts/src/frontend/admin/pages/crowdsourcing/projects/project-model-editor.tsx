import { UniversalComponent } from '../../../../types';
import { createUniversalComponent, useData } from '../../../utility';
import { DocumentEditor, DocumentStore, FieldEditor, StructureStore, EditorContext } from '@capture-models/editor';
import React from 'react';
import { BaseField } from '@capture-models/types';
import { Header } from '../../../atoms/Header';

type ProjectModelEditorType = {
  params: { id: string };
  query: {};
  variables: { id: number };
  data: any;
};

const FullDocumentEditor: React.FC = () => {
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
                  removeStructureField({ term: state.selectedField });
                }
                actions.deselectField();
              }}
            />
          </div>
        ) : (
          <div>
            <Header>No field selected</Header>
          </div>
        )}
      </div>
    </div>
  );
};

export const ProjectModelEditor: UniversalComponent<ProjectModelEditorType> = createUniversalComponent<
  ProjectModelEditorType
>(
  () => {
    const { data, status } = useData(ProjectModelEditor);

    if (!data || status !== 'success') {
      return <div>Loading...</div>;
    }

    console.log(data);

    return (
      <EditorContext captureModel={data}>
        <FullDocumentEditor />
      </EditorContext>
    );
  },
  {
    getData: async (key, { id }, api) => {
      const { capture_model_id } = await api.getProject(id);

      return api.getCaptureModel(capture_model_id);
    },
    getKey: params => {
      return ['project-model', { id: Number(params.id) }];
    },
  }
);
