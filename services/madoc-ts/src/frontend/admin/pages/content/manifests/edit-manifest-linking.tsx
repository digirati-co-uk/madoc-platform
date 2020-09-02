import React from 'react';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { ResourceLinkResponse } from '../../../../../database/queries/linking-queries';
import { useData } from '../../../../shared/hooks/use-data';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../../../shared/atoms/Table';
import { SmallButton } from '../../../../shared/atoms/Button';

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
        <TableContainer>
          {data?.linking.map((item, key) => {
            return (
              <TableRow key={key}>
                <TableRowLabel>
                  <strong>{item.link.type}</strong>
                </TableRowLabel>
                <TableRowLabel>
                  <a href={item.link.id} target="_top">
                    {item.link.id}
                  </a>
                </TableRowLabel>
              </TableRow>
            );
          })}
        </TableContainer>
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
