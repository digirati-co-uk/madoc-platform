import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import { MetadataDiff } from "../../../../shared/hooks/use-metadata-editor";
import { UniversalComponent } from '../../../../types';
import { useApi } from '../../../../shared/hooks/use-api';
import { mapMetadataList, ParsedMetadata } from '../../../../../utility/map-metadata-list';
import { MetadataListEditor } from '../../../molecules/MetadataListEditor';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type EditCanvasMetadataType = {
  params: { id: number };
  query: {};
  variables: { id: number };
  data: ParsedMetadata;
};

export const EditCanvasMetadata: UniversalComponent<EditCanvasMetadataType> = createUniversalComponent<
  EditCanvasMetadataType
>(
  () => {
    const params = useParams<{ id: string; manifestId?: string }>();
    const history = useHistory();
    const [invalidateTime, setInvalidateTime] = useState(Date.now());
    const { data, status } = useData(EditCanvasMetadata);
    const api = useApi();

    useEffect(() => {
      setInvalidateTime(Date.now());
    }, [data]);

    const redirectUrl = params.manifestId
      ? `/manifests/${params.manifestId}/canvases/${params.id}`
      : `/canvases/${params.id}`;

    const [saveChanges] = useMutation(async ({ diff, empty }: { diff: MetadataDiff; empty: boolean }) => {
      if (empty) {
        history.push(redirectUrl);
        return;
      }

      await api.updateCanvasMetadata(Number(params.id), diff);

      history.push(redirectUrl);
    });

    if (status === 'loading' || status === 'error' || !data) {
      return <div>loading...</div>;
    }

    return (
      <MetadataListEditor key={invalidateTime} metadata={data} template={['label', 'summary']} onSave={saveChanges} />
    );
  },
  {
    getData: async (key, vars, api) => {
      const metadata = await api.getCanvasMetadata(vars.id);
      return mapMetadataList(metadata);
    },
    getKey: params => {
      return ['canvas-metadata', { id: params.id }];
    },
  }
);
