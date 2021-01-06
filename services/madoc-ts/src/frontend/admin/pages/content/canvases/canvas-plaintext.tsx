import React from 'react';
import { useMutation } from 'react-query';
import { Button } from '../../../../shared/atoms/Button';
import { WarningMessage } from '../../../../shared/atoms/WarningMessage';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useParams } from 'react-router-dom';

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
      return ['canvas-search-index', { id: Number(params.id) }];
    },
    getData: async (key, { id }, api) => {
      return await api.getCanvasPlaintext(id);
    },
  }
);
