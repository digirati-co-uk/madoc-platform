import React, { useEffect, useState } from 'react';
import { useMutation, queryCache } from 'react-query';
import { useParams } from 'react-router-dom';
import { UniversalComponent } from '../../../../types';
import { MetadataDiff } from '../../../molecules/MetadataEditor';
import { useApi } from '../../../../shared/hooks/use-api';
import { mapMetadataList, ParsedMetadata } from '../../../../../utility/map-metadata-list';
import { MetadataListEditor } from '../../../molecules/MetadataListEditor';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { SuccessMessage } from '../../../../shared/atoms/SuccessMessage';
import { ErrorMessage } from '../../../../shared/atoms/ErrorMessage';

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
    const [invalidateTime, setInvalidateTime] = useState(Date.now());
    const { data, status } = useData(ProjectMetadata, {}, { refetchInterval: false });
    const api = useApi();
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
      setInvalidateTime(Date.now());
    }, [data]);

    useEffect(() => {
      if (!success) return;

      const timeout = setTimeout(() => setSuccess(''), 3000);

      return () => clearTimeout(timeout);
    }, [success]);

    const [saveChanges] = useMutation(async ({ diff, empty }: { diff: MetadataDiff; empty: boolean }) => {
      if (empty) {
        setSuccess('Nothing changed');
        return;
      }

      try {
        const resp = await api.updateProjectMetadata(Number(params.id), diff);
        if (resp.error) {
          setError(resp.error);
          setSuccess('');
          return;
        }
        await queryCache.invalidateQueries(['get-project', { id: Number(params.id) }]);

        setSuccess('Changes saved');
      } catch (err) {
        setSuccess('');
        setError(err.message || 'Unknown error');
      }
    });

    if (status === 'loading' || status === 'error' || !data) {
      return <div>loading...</div>;
    }

    return (
      <>
        {success ? <SuccessMessage>{success}</SuccessMessage> : null}
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        <MetadataListEditor
          key={invalidateTime}
          metadata={data.metadata}
          template={data.template}
          onSave={saveChanges}
        />
      </>
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
