import { DocumentStore, StructureStore } from '@capture-models/editor';
import { generateId, traverseDocument } from '@capture-models/helpers';
import React, { useEffect, useMemo } from 'react';

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
      const fullTree = { value: null } as any;
      traverseDocument<{ value: any[] }>(newDocument, {
        beforeVisitEntity: (entity, key, parent) => {
          entity.temp = entity.temp ? entity.temp : { value: [] };
          if (parent && parent.temp && parent.temp.value) {
            parent.temp.value.push([key, entity.temp.value]);
          }
        },
        visitField: (field, key, parent) => {
          field.temp = { value: key as any };
          if (parent && parent.temp && parent.temp.value) {
            parent.temp.value.push(key);
          }
        },
        visitEntity: (entity, key, parent) => {
          if (!parent && entity.temp && entity.temp.value) {
            // The root has complete.
            fullTree.value = entity.temp.value;
          }
        },
      });

      if (fullTree.value) {
        try {
          setModelFields({
            index: [0],
            fields: fullTree.value,
          });
        } catch (e) {
          // If it fails that's fine, its a UX improvement.
        }
      }
    }
  }, [newDocument, automaticStructure, setModelFields]);

  return null;
};
