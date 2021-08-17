import { Tag } from '@capture-models/editor';
import React, { useEffect, useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import ReactTimeago from 'react-timeago';
import { User } from '../../../../extensions/site-manager/types';
import { Button, ButtonRow } from '../../../shared/atoms/Button';
import { SimpleTable } from '../../../shared/atoms/SimpleTable';
import { SuccessMessage } from '../../../shared/atoms/SuccessMessage';
import { WidePage } from '../../../shared/atoms/WidePage';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useUser } from '../../../shared/hooks/use-site';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';
import { Pagination } from '../../molecules/Pagination';
import { Pagination as _Pagination } from '../../../../types/schemas/_pagination';

export const ListUsers: React.FC = () => {
  const { data } = usePaginatedData<{ users: User[]; pagination: _Pagination }>(ListUsers);
  const query = useLocationQuery();
  const currentUser = useUser();
  const history = useHistory();
  const [userDeleted, setUserDeleted] = useState(false);

  useEffect(() => {
    if (query.user_deleted) {
      setUserDeleted(true);
      history.push(`/global/users`);
    }
  }, [history, query.user_deleted]);

  if (currentUser?.role !== 'global_admin') {
    return <Redirect to={'/'} />;
  }

  return (
    <>
      <AdminHeader
        title="Manage users"
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Users', link: '/global/users', active: true },
        ]}
      />
      {userDeleted ? <SuccessMessage>User deleted</SuccessMessage> : null}
      <WidePage>
        <ButtonRow>
          <Button as={HrefLink} href={`/global/users/create`}>
            Create user
          </Button>
        </ButtonRow>
        <Pagination
          page={data ? data.pagination.page : 1}
          totalPages={data ? data.pagination.totalPages : 1}
          stale={!data}
        />
        <SimpleTable.Table>
          <thead>
            <SimpleTable.Row>
              <SimpleTable.Cell>
                <strong>ID</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Name</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Email</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Is active</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Created</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Last modified</strong>
              </SimpleTable.Cell>
              <SimpleTable.Cell>
                <strong>Global role</strong>
              </SimpleTable.Cell>
            </SimpleTable.Row>
          </thead>
          <tbody>
            {data?.users.map(user => (
              <SimpleTable.Row key={user.id}>
                <SimpleTable.Cell>{user.id}</SimpleTable.Cell>
                <SimpleTable.Cell>
                  <HrefLink href={`/global/users/${user.id}`}>{user.name}</HrefLink>
                </SimpleTable.Cell>
                <SimpleTable.Cell>{user.email}</SimpleTable.Cell>
                <SimpleTable.Cell>{user.is_active ? 'active' : 'inactive'}</SimpleTable.Cell>
                <SimpleTable.Cell>
                  <ReactTimeago date={new Date(user.created)} />
                </SimpleTable.Cell>
                <SimpleTable.Cell>
                  {user.modified ? <ReactTimeago date={new Date(user.modified)} /> : '-'}
                </SimpleTable.Cell>
                <SimpleTable.Cell>
                  <Tag>{user.role}</Tag>
                </SimpleTable.Cell>
              </SimpleTable.Row>
            ))}
          </tbody>
        </SimpleTable.Table>
        <Pagination
          page={data ? data.pagination.page : 1}
          totalPages={data ? data.pagination.totalPages : 1}
          stale={!data}
        />
      </WidePage>
    </>
  );
};

serverRendererFor(ListUsers, {
  getKey: (params, query) => [`system-all-users`, { page: query.page ? Number(query.page) : 1 }],
  getData: (key, vars, api) => api.siteManager.listAllUsers(vars.page),
});
