import React from 'react';
import { SiteUser } from '../../../extensions/site-manager/types';
import { TableContainer, TableRow, TableRowLabel } from '../../shared/layout/Table';
import { useData } from '../../shared/hooks/use-data';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../types';
import { Tag } from '../../shared/capture-models/editor/atoms/Tag';
import { getBotType } from '../../../automation/utils/get-bot-type';

type ViewUserType = {
  query: any;
  variables: { id: number };
  params: { id: string };
  data: { user: SiteUser };
  context: any;
};

export const ViewUser: UniversalComponent<ViewUserType> = createUniversalComponent<ViewUserType>(
  () => {
    const { data } = useData(ViewUser);

    if (!data) {
      return <div>Loading...</div>;
    }

    return (
      <>
        <div style={{ display: 'flex' }}>
          <h1>{data.user.name}</h1>
          {data.user.automated ? (
            <Tag style={{ alignSelf: 'center', marginLeft: '.5em' }}>
              {getBotType(data.user.config?.bot?.type) || 'bot'}
            </Tag>
          ) : null}
        </div>
        <TableContainer>
          <TableRow>
            <TableRowLabel>
              <strong>Email</strong>
            </TableRowLabel>
            <TableRowLabel>{data.user.email}</TableRowLabel>
          </TableRow>
          <TableRow>
            <TableRowLabel>
              <strong>Role</strong>
            </TableRowLabel>
            <TableRowLabel>{data.user.site_role}</TableRowLabel>
          </TableRow>
          <TableRow>
            <TableRowLabel>
              <strong>ID</strong>
            </TableRowLabel>
            <TableRowLabel>urn:madoc:user:{data.user.id}</TableRowLabel>
          </TableRow>
        </TableContainer>
      </>
    );
  },
  {
    getKey: params => {
      return ['GetUser', { id: Number(params.id) }];
    },
    getData: (key, vars, api) => {
      return api.getUser(vars.id);
    },
  }
);
