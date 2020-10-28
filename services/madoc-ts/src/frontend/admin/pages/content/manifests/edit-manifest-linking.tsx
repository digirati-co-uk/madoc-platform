import React from 'react';
import { LinkingProperty } from '../../../../shared/atoms/LinkingProperty';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { ResourceLinkResponse } from '../../../../../database/queries/linking-queries';
import { useData } from '../../../../shared/hooks/use-data';
import { TableContainer } from '../../../../shared/atoms/Table';

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
    const { data, refetch } = useData(EditManifestLinking);

    return (
      <TableContainer style={{ background: '#EEEEEE' }}>
        {data?.linking.map(item => {
          return <LinkingProperty key={item.link.id} link={item} refetch={refetch} />;
        })}
      </TableContainer>
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
