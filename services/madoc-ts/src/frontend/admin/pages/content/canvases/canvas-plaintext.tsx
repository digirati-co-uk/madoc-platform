import React from 'react';
import { WarningMessage } from '../../../../shared/callouts/WarningMessage';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type CanvasPlaintextType = {
  params: { id: string };
  query: {};
  variables: { id: number };
  data: { found: boolean; transcription: string };
};

export const CanvasPlaintext = createUniversalComponent<CanvasPlaintextType>(
  () => {
    const { data } = useData(CanvasPlaintext, {}, { retry: 0 });

    if (!data) {
      return <div>loading...</div>;
    }

    return (
      <div>
        <h2>Plaintext transcription</h2>
        {data.found ? <pre>{data.transcription}</pre> : <WarningMessage>Plaintext not found</WarningMessage>}
      </div>
    );
  },
  {
    getKey: params => {
      return ['canvas-plaintext', { id: Number(params.id) }];
    },
    getData: async (key, { id }, api) => {
      return await api.getCanvasPlaintext(id);
    },
  }
);
