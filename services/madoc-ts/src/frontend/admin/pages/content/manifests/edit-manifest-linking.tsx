import React from 'react';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { ResourceLinkResponse } from '../../../../../database/queries/linking-queries';
import { useData } from '../../../../shared/hooks/use-data';

type EditManifestLinkingType = {
  query: {};
  params: { id: string };
  data: { linking: ResourceLinkResponse[] };
  variables: { id: number };
};

export const EditManifestLinking: UniversalComponent<EditManifestLinkingType> = createUniversalComponent<
  EditManifestLinkingType
>(
  props => {
    const { data } = useData(EditManifestLinking);

    return (
      <>
        <pre>{JSON.stringify(props, null, 2)}</pre>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </>
    );
  },
  {
    getKey(params) {
      return ['manifest-linking', { id: Number(params.id) }];
    },
    getData(key, vars, api) {
      return api.getManifestLinking(vars.id);
    },
  }
);
