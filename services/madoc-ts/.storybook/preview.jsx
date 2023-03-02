import React from 'react';
import { DndProvider } from 'react-dnd';
import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/cjs/HTML5toTouch';
import { ApiContext } from '../src/frontend/shared/hooks/use-api';
import { MemoryRouter } from 'react-router-dom';
import { VaultProvider } from "react-iiif-vault";
import '../src/frontend/shared/capture-models/editor/bundle';

export const decorators = [function(Story) {
  return (

    <MemoryRouter>
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <ApiContext.Provider value={undefined}>
          <React.Suspense fallback={null}>
            <VaultProvider>
              <Story />
            </VaultProvider>
          </React.Suspense>
        </ApiContext.Provider>
      </DndProvider>
    </MemoryRouter>
  );
}];
