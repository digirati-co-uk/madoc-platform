import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { MetadataDiff } from '../../../../shared/hooks/use-metadata-editor';
import { UniversalComponent } from '../../../../types';
import { useApi } from '../../../../shared/hooks/use-api';
import { mapMetadataList, ParsedMetadata } from '../../../../../utility/map-metadata-list';
import { MetadataListEditor } from '../../../molecules/MetadataListEditor';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

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
    const navigate = useNavigate();
    const [invalidateTime, setInvalidateTime] = useState(Date.now());
    const { data, status } = useData(EditManifestMetadata, undefined, {
      refetchIntervalInBackground: false,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    });
    const api = useApi();

    useEffect(() => {
      setInvalidateTime(Date.now());
    }, [data]);

    const [saveChanges] = useMutation(async ({ diff, empty }: { diff: MetadataDiff; empty: boolean }) => {
      if (empty) {
        navigate(`/manifests/${params.id}`);
        return;
      }

      await api.updateManifestMetadata(Number(params.id), diff);

      navigate(`/manifests/${params.id}`);
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
      const metadata = await api.getManifestMetadata(vars.id);
      return mapMetadataList(metadata);
    },
    getKey: params => {
      return ['manifest-metadata', { id: params.id }];
    },
  }
);
