import React, { useEffect, useState } from 'react';
import { useMutation, queryCache } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent, useData } from '../../../utility';
import { MetadataDiff } from '../../../molecules/MetadataEditor';
import { useApi } from '../../../hooks/use-api';
import { mapMetadataList, ParsedMetadata } from '../../../../../utility/map-metadata-list';
import { MetadataListEditor } from '../../../molecules/MetadataListEditor';

type ProjectMetadataType = {
  params: { id: number };
  query: {};
  variables: { id: number };
  data: {
    metadata: ParsedMetadata;
    template: string[];
  };
};

export const ProjectMetadata: UniversalComponent<ProjectMetadataType> = createUniversalComponent<ProjectMetadataType>(
  () => {
    const params = useParams<{ id: string }>();
    const history = useHistory();
    const [invalidateTime, setInvalidateTime] = useState(Date.now());
    const { data, status } = useData(ProjectMetadata, {}, { refetchInterval: false });
    const api = useApi();

    useEffect(() => {
      setInvalidateTime(Date.now());
    }, [data]);

    const [saveChanges] = useMutation(async ({ diff, empty }: { diff: MetadataDiff; empty: boolean }) => {
      if (empty) {
        history.push(`/projects/${params.id}`);
        return;
      }

      await api.updateProjectMetadata(Number(params.id), diff);
      queryCache.refetchQueries(['get-project', { id: Number(params.id) }]);

      history.push(`/projects/${params.id}`);
    });

    if (status === 'loading' || status === 'error' || !data) {
      return <div>loading...</div>;
    }

    return (
      <MetadataListEditor key={invalidateTime} metadata={data.metadata} template={data.template} onSave={saveChanges} />
    );
  },
  {
    getData: async (key, vars, api) => {
      const metadata = await api.getProjectMetadata(vars.id);
      return {
        metadata: mapMetadataList(metadata),
        template: metadata.template || [],
      };
    },
    getKey: params => {
      return ['project-metadata', { id: params.id }];
    },
  }
);
