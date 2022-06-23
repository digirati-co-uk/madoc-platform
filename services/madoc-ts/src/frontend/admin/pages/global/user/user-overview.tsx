import React from 'react';
import { useMutation } from 'react-query';
import { GetUser } from '../../../../../extensions/site-manager/types';
import { TimeAgo } from '../../../../shared/atoms/TimeAgo';
import { Button } from '../../../../shared/navigation/Button';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { TableContainer, TableRow, TableRowLabel } from '../../../../shared/layout/Table';
import { WarningMessage } from '../../../../shared/callouts/WarningMessage';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { Spinner } from '../../../../shared/icons/Spinner';
import { ViewUser } from '../view-user';

export const UserOverview: React.FC = () => {
  const { data, refetch } = useData<GetUser>(ViewUser);
  const api = useApi();
  const [activateUser, activateUserStatus] = useMutation(async () => {
    if (data) {
      await api.siteManager.activateUser(data.user.id);
      await refetch();
    }
  });

  const [deactivateUser, deactivateUserStatus] = useMutation(async () => {
    if (data) {
      await api.siteManager.deactivateUser(data.user.id);
      await refetch();
    }
  });

  if (!data) {
    return <Spinner />;
  }

  return (
    <>
      {data.user.is_active ? (
        <SuccessMessage>User account active</SuccessMessage>
      ) : (
        <WarningMessage>User account not active</WarningMessage>
      )}
      <h1>{data.user.name}</h1>
      <TableContainer>
        <TableRow>
          <TableRowLabel>
            <strong>Id</strong>
          </TableRowLabel>
          <TableRowLabel>{data.user.id}</TableRowLabel>
        </TableRow>
        <TableRow>
          <TableRowLabel>
            <strong>Name</strong>
          </TableRowLabel>
          <TableRowLabel>{data.user.name}</TableRowLabel>
        </TableRow>
        <TableRow>
          <TableRowLabel>
            <strong>Email</strong>
          </TableRowLabel>
          <TableRowLabel>{data.user.email}</TableRowLabel>
        </TableRow>
        <TableRow>
          <TableRowLabel>
            <strong>Global role</strong>
          </TableRowLabel>
          <TableRowLabel>{data.user.role}</TableRowLabel>
        </TableRow>
        <TableRow>
          <TableRowLabel>
            <strong>Created</strong>
          </TableRowLabel>
          <TableRowLabel>
            <TimeAgo date={new Date(data.user.created)} />
          </TableRowLabel>
        </TableRow>
        {data.user.modified ? (
          <TableRow>
            <TableRowLabel>
              <strong>Last modified</strong>
            </TableRowLabel>
            <TableRowLabel>
              <TimeAgo date={new Date(data.user.modified)} />
            </TableRowLabel>
          </TableRow>
        ) : null}
        <TableRow>
          <TableRowLabel>
            <strong>URN</strong>
          </TableRowLabel>
          <TableRowLabel>urn:madoc:user:{data.user.id}</TableRowLabel>
        </TableRow>
      </TableContainer>
      {data.user.is_active ? (
        <Button disabled={deactivateUserStatus.isLoading} $primary $error onClick={() => deactivateUser()}>
          Deactivate user
        </Button>
      ) : (
        <Button disabled={activateUserStatus.isLoading} $primary onClick={() => activateUser()}>
          Activate user
        </Button>
      )}
    </>
  );
};
