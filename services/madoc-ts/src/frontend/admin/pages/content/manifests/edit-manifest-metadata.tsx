import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent, useData } from '../../../utility';
import { MetadataDiff } from '../../../molecules/MetadataEditor';
import { useApi } from '../../../hooks/use-api';
import { mapMetadataList, ParsedMetadata } from '../../../../../utility/map-metadata-list';
import { MetadataListEditor } from '../../../molecules/MetadataListEditor';

type EditManifestMetadataType = {
  params: { id: number };
  query: {};
  variables: { id: number };
  data: ParsedMetadata;
};

export const EditManifestMetadata: UniversalComponent<EditManifestMetadataType> = createUniversalComponent<
  EditManifestMetadataType
>(
  () => {
    const params = useParams<{ id: string }>();
    const history = useHistory();
    const [invalidateTime, setInvalidateTime] = useState(Date.now());
    const { data, status } = useData(EditManifestMetadata);
    const api = useApi();

    useEffect(() => {
      setInvalidateTime(Date.now());
    }, [data]);

    const [saveChanges] = useMutation(async ({ diff, empty }: { diff: MetadataDiff; empty: boolean }) => {
      if (empty) {
        history.push(`/manifests/${params.id}`);
        return;
      }

      await api.updateManifestMetadata(Number(params.id), diff);

      history.push(`/manifests/${params.id}`);
    });

    if (status === 'loading' || status === 'error' || !data) {
      return <div>loading...</div>;
    }

    return <MetadataListEditor key={invalidateTime} metadata={data} onSave={saveChanges} />;
  },
  {
    getData: async (key, vars, api) => {
      const metadata = await api.getManifestMetadata(vars.id);
      return mapMetadataList(metadata);
    },
    getKey: params => {
      return ['manifest-metadata', { id: params.id }];
    },
  }
);
