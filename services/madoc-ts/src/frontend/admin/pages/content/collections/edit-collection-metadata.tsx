import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent, useData } from '../../../utility';
import { MetadataDiff } from '../../../molecules/MetadataEditor';
import { useApi } from '../../../hooks/use-api';
import { mapMetadataList, ParsedMetadata } from '../../../../../utility/map-metadata-list';
import { MetadataListEditor } from '../../../molecules/MetadataListEditor';

type EditCollectionMetadataType = {
  params: { id: number };
  query: {};
  variables: { id: number };
  data: ParsedMetadata;
};

export const EditCollectionMetadata: UniversalComponent<EditCollectionMetadataType> = createUniversalComponent<
  EditCollectionMetadataType
>(
  () => {
    const params = useParams<{ id: string }>();
    const history = useHistory();
    const [invalidateTime, setInvalidateTime] = useState(Date.now());
    const { data, status, refetch } = useData(EditCollectionMetadata, {}, { refetchInterval: false });
    const api = useApi();

    useEffect(() => {
      setInvalidateTime(Date.now());
    }, [data]);

    const [saveChanges] = useMutation(async ({ diff, empty }: { diff: MetadataDiff; empty: boolean }) => {
      if (empty) {
        history.push(`/collections/${params.id}`);
        return;
      }

      await api.updateCollectionMetadata(Number(params.id), diff);
      await refetch();

      history.push(`/collections/${params.id}`);
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
      const metadata = await api.getCollectionMetadata(vars.id);
      return mapMetadataList(metadata);
    },
    getKey: params => {
      return ['collection-metadata', { id: params.id }];
    },
  }
);
