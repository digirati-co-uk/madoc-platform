import React, { useEffect, useRef } from 'react';
import { createContext } from '../../../helpers/create-context';
import { CaptureModel } from '../../../types/capture-model';
import { DocumentStore } from '../../stores/document/document-store';
import { StructureStore } from '../../stores/structure/structure-store';
import { useDebouncedCallback } from 'use-debounce';

export const [useCaptureModel, CaptureModelProvider] = createContext<CaptureModel>('CaptureModel');

const ChangeObserver: React.FC<{
  onDocumentChange: (doc: CaptureModel['document']) => void;
  onStructureChange: (structure: CaptureModel['structure']) => void;
}> = props => {
  const doc = DocumentStore.useStore();
  const struct = StructureStore.useStore();

  const lastStructure = useRef<CaptureModel['structure']>(undefined);
  const lastDocument = useRef<CaptureModel['document']>(undefined);

  const [onDocumentChange] = useDebouncedCallback(props.onDocumentChange, 300, {
    trailing: true,
  });
  const [onStructureChange] = useDebouncedCallback(props.onStructureChange, 300, {
    trailing: true,
  });

  useEffect(() => {
    return doc.subscribe(() => {
      const state = doc.getState();

      if (state.document !== lastDocument.current) {
        lastDocument.current = state.document;
        onDocumentChange(state.document);
      }
    });
  });
  useEffect(() => {
    return struct.subscribe(() => {
      const state = struct.getState();

      if (state.structure !== lastStructure.current) {
        lastStructure.current = state.structure;
        onStructureChange(state.structure);
      }
    });
  });

  return null;
};

export const EditorContext: React.FC<{
  captureModel: CaptureModel;
  onDocumentChange?: (doc: CaptureModel['document']) => void;
  onStructureChange?: (structure: CaptureModel['structure']) => void;
}> = ({ captureModel, onDocumentChange, onStructureChange, children }) => {
  return (
    <CaptureModelProvider value={captureModel}>
      <StructureStore.Provider initialData={{ captureModel }}>
        <DocumentStore.Provider initialData={{ captureModel }}>
          {onDocumentChange && onStructureChange ? (
            <ChangeObserver onDocumentChange={onDocumentChange} onStructureChange={onStructureChange} />
          ) : null}
          {children}
        </DocumentStore.Provider>
      </StructureStore.Provider>
    </CaptureModelProvider>
  );
};
