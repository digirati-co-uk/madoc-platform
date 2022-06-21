import React from 'react';
import { CanvasFull } from '../../../../../types/canvas-full';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type CanvasJsonType = {
  params: { id: string };
  query: any;
  variables: { id: number };
  data: CanvasFull;
};

export const CanvasJson = createUniversalComponent<CanvasJsonType>(
  () => {
    const { data } = useData(CanvasJson, {}, { retry: 0 });

    if (!data) {
      return <div>loading...</div>;
    }

    return (
      <div>
        <h2>Canvas as JSON</h2>
        <pre>{JSON.stringify(data.canvas, null, 2)}</pre>
      </div>
    );
  },
  {
    getKey: params => {
      return ['canvas-plaintext', { id: Number(params.id) }];
    },
    getData: async (key, { id }, api) => {
      return await api.getCanvasById(id);
    },
  }
);
