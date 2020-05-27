import React from 'react';
import { UniversalComponent } from '../../../../types';
import { CanvasFull } from '../../../../../types/schemas/canvas-full';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type CanvasDetailsType = {
  params: { id: number; manifestId: number };
  query: {};
  variables: { id: number };
  data: CanvasFull;
};

export const CanvasDetails: UniversalComponent<CanvasDetailsType> = createUniversalComponent<CanvasDetailsType>(
  () => {
    const { data, status } = useData(CanvasDetails);

    if (status === 'loading' || status === 'error' || !data) {
      return <div>Loading...</div>;
    }

    const { canvas } = data;

    return (
      <div>
        {canvas.thumbnail ? <img src={canvas.thumbnail} /> : null}
        <div>
          Dimensions: {canvas.width} x {canvas.height}
        </div>
      </div>
    );
  },
  {
    getKey: params => {
      return ['view-canvas', { id: params.id }];
    },
    getData: async (key, vars, api) => {
      return await api.getCanvasById(vars.id);
    },
  }
);
