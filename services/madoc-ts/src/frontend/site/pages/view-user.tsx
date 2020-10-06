import React from 'react';
import { SingleUser } from '../../../types/omeka/User';
import { TableContainer, TableRow, TableRowLabel } from '../../shared/atoms/Table';
import { useData } from '../../shared/hooks/use-data';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../types';

type ViewUserType = {
  query: {};
  variables: { id: number };
  params: { id: string };
  data: { user: SingleUser };
  context: {};
};

export const ViewUser: UniversalComponent<ViewUserType> = createUniversalComponent<ViewUserType>(
  () => {
    const { data } = useData(ViewUser);

    if (!data) {
      return <div>Loading...</div>;
    }

    return (
      <>
        <h1>{data.user.name}</h1>
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
            <TableRowLabel>{data.user.role}</TableRowLabel>
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
