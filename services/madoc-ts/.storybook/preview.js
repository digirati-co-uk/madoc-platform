import React from 'react';
import { DndProvider } from 'react-dnd';
import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/cjs/HTML5toTouch';
import { ApiContext } from '../src/frontend/shared/hooks/use-api';
import { MemoryRouter } from 'react-router-dom';

export const decorators = [(Story) => {
  return (
    <MemoryRouter>
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <ApiContext>
          <Story />
        </ApiContext>
      </DndProvider>
    </MemoryRouter>
  )
}];
