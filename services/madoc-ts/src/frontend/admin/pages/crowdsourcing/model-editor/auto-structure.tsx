import React, { useEffect, useMemo } from 'react';
import { generateModelFields } from '../../../../../utility/generate-model-fields';
import { DocumentStore } from '../../../../shared/capture-models/editor/stores/document/document-store';
import { StructureStore } from '../../../../shared/capture-models/editor/stores/structure/structure-store';
import { generateId } from '../../../../shared/capture-models/helpers/generate-id';

export const AutoStructure: React.FC = () => {
  const newDocument = DocumentStore.useStoreState(s => s.document);
  const structure = StructureStore.useStoreState(s => s.structure);
  const setModelFields = StructureStore.useStoreActions(a => a.setModelFields);
  const addStructureToChoice = StructureStore.useStoreActions(a => a.addStructureToChoice);

  useEffect(() => {
    if (structure && structure.type === 'choice' && structure.items.length === 0) {
      addStructureToChoice({
        index: [],
        structure: {
          label: 'Default',
          description: '',
          id: generateId(),
          type: 'model',
          fields: [],
        },
      });
    }
  }, [addStructureToChoice, structure]);

  const automaticStructure = useMemo(() => {
    if (!structure) {
      return false;
    }
    if (structure.type !== 'choice') {
      return false;
    }

    if (structure.items.length > 1) {
      return false;
    }

    const onlyModel = structure.items[0];

    if (!onlyModel) {
      return false;
    }

    if (onlyModel.type !== 'model') {
      return false;
    }

    return onlyModel.label === 'Default';
  }, [structure]);

  useEffect(() => {
    // When the document changes, can we update the structure?
    if (newDocument && automaticStructure) {
      const newModelFields = generateModelFields(newDocument);
      if (newModelFields.length) {
        try {
          setModelFields({
            index: [0],
            fields: newModelFields,
          });
        } catch (e) {
          // If it fails that's fine, its a UX improvement.
        }
      }
    }
  }, [newDocument, automaticStructure, setModelFields]);

  return null;
};
