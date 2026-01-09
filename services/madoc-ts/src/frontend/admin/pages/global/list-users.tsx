import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getBotType } from '../../../../automation/utils/get-bot-type';
import { User } from '../../../../extensions/site-manager/types';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import { Tag } from '../../../shared/capture-models/editor/atoms/Tag';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { SimpleTable } from '../../../shared/layout/SimpleTable';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { WidePage } from '../../../shared/layout/WidePage';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useUser } from '../../../shared/hooks/use-site';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';
import { Pagination } from '../../molecules/Pagination';
import { Pagination as _Pagination } from '../../../../types/schemas/_pagination';
import { validateEmail } from '../../../../utility/validate-email';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getSortedRowModel } from '@tanstack/react-table';
import { ItemFilter } from '../../../shared/components/ItemFilter';
import { useLocationState } from '../../../shared/hooks/use-location-state';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
    cell: info => <HrefLink href={`/global/users/${info.row.original.id}`}>{info.getValue() as string}</HrefLink>,
  },
  {
    accessorKey: 'email',
    enableSorting: true,
    header: 'Email',
  },
  {
    accessorKey: 'is_active',
    header: 'Is active',
    cell: info => (info.getValue() ? 'active' : 'inactive'),
  },
  {
    accessorKey: 'created',
    header: 'Created',
    cell: info => <TimeAgo date={new Date(info.getValue() as string)} />,
  },
  {
    accessorKey: 'modified',
    header: 'Last modified',
    enableSorting: true,
    cell: info => (info.getValue() ? <TimeAgo date={new Date(info.getValue() as string)} /> : '-'),
  },
  {
    accessorKey: 'role',
    header: 'Global role',
    cell: info => <Tag>{info.getValue() as string}</Tag>,
  },
  {
    id: 'automated',
    header: 'Automated',
    cell: info => {
      const user = info.row.original;
      return user.automated ? <Tag>{getBotType(user.config?.bot?.type) || 'bot'}</Tag> : null;
    },
  },
];

export const ListUsers: React.FC = () => {
  const { data } = usePaginatedData<{ users: User[]; pagination: _Pagination }>(ListUsers);
  const [
    query,
    setQuery,
    {
      onSortingChange,
      sortingState
    }
  ] = useLocationState();


  const currentUser = useUser();
  const navigate = useNavigate();
  const [userDeleted, setUserDeleted] = useState(false);

  const activeFilter = query.status;
  const setActiveFilter = (value: string) => {
    setQuery({ ...query, status: value });
  };

  const roleFilter = query.role || null;
  const setRoleFilter = (value: string | null) => {
    setQuery({ ...query, role: value || undefined });
  };

  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];

    return data.users.filter(user => {
      if (roleFilter && user.role !== roleFilter) return false;
      return !(activeFilter && (user.is_active ? 'active' : 'inactive') !== activeFilter);
    });
  }, [data?.users, roleFilter, activeFilter]);

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: { sorting: sortingState },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    if (query.user_deleted) {
      setUserDeleted(true);
      navigate(`/global/users`);
    }
  }, [query.user_deleted]);

  if (currentUser?.role !== 'global_admin') {
    return <Navigate to={'/'} />;
  }

  const invalidUsers = data?.users?.filter(t => !t.automated && !validateEmail(t.email)) || [];

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
      {invalidUsers.length > 0 && (
        <ErrorMessage>
          Some users have registered with an invalid email, you can remove them from{' '}
          <HrefLink href="/global/status">here</HrefLink>
        </ErrorMessage>
      )}
      <WidePage>
        <ButtonRow>
          <Button as={HrefLink} href={`/global/users/create`}>
            Create user
          </Button>
          <Button as={HrefLink} href={`/global/users/create-bot`}>
            Create bot
          </Button>
          <ItemFilter
            label={roleFilter ?? 'Filter by role'}
            closeOnChange
            items={[
              { label: 'Global admin', id: 'global_admin' },
              { label: 'Site admin', id: 'site_admin' },
              { label: 'Editor', id: 'editor' }, // @todo remove?
              { label: 'Reviewer', id: 'reviewer' }, // @todo remove?
              { label: 'Author', id: 'author' }, // @todo remove?
              { label: 'Researcher', id: 'researcher' }, // @todo remove?
              { label: 'Transcriber', id: 'Transcriber' }, // @todo lowercase.
            ].map(role => ({
              id: role.id,
              label: role.label,
              onChange: selected => {
                setRoleFilter(selected ? role.id : null);
              },
            }))}
            selected={roleFilter ? [roleFilter] : []}
          />

          <ItemFilter
            label={activeFilter ?? 'Filter by status'}
            closeOnChange
            items={[
              { id: 'active', label: 'Active' },
              { id: 'inactive', label: 'Inactive' },
            ].map(s => ({
              id: s.id,
              label: s.label,
              onChange: selected => {
                setActiveFilter(selected ? (s.id as any) : null);
              },
            }))}
            selected={activeFilter ? [activeFilter] : []}
          />

          {(roleFilter || activeFilter) && (
            <Button
              onClick={() => {
                setQuery({
                  role: undefined,
                  status: undefined,
                  sort: undefined,
                })
              }}
            >
              Reset filters
            </Button>
          )}
        </ButtonRow>
        {data?.pagination.totalPages > 1 && (
          <Pagination
            page={data ? data.pagination.page : 1}
            totalPages={data ? data.pagination.totalPages : 1}
            stale={!data}
          />
        )}
        <SimpleTable.Table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <SimpleTable.Row key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <SimpleTable.Header
                    key={header.id}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    style={{
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}

                    {header.column.getCanSort() && (
                      <span style={{ marginLeft: 6, opacity: header.column.getIsSorted() ? 1 : 0.35 }}>
                        {{
                          asc: '↑',
                          desc: '↓',
                        }[header.column.getIsSorted() as string] ?? '⇅'}
                      </span>
                    )}
                  </SimpleTable.Header>
                ))}
              </SimpleTable.Row>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map(row => {
              const user = row.original;
              const isInvalid = !user.automated && !validateEmail(user.email);
              return (
                <SimpleTable.Row key={row.id} $interactive style={{ background: isInvalid ? '#FDD6D6' : undefined }}>
                  {row.getVisibleCells().map(cell => (
                    <SimpleTable.Cell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </SimpleTable.Cell>
                  ))}
                </SimpleTable.Row>
              );
            })}
          </tbody>
        </SimpleTable.Table>
        {data?.pagination.totalPages > 1 && (
          <Pagination
            page={data ? data.pagination.page : 1}
            totalPages={data ? data.pagination.totalPages : 1}
            stale={!data}
          />
        )}
      </WidePage>
    </>
  );
};

serverRendererFor(ListUsers, {
  getKey: (params, query) => [
    `system-all-users`,
    {
      page: query.page ? Number(query.page) : 1,
      roles: query.roles,
      role: query.role,
      status: query.status,
      automated: query.automated === 'true' ? true : query.automated === 'false' ? false : undefined,
      sort: query.sort || 'id',
      asc: query.asc === 'true',
    },
  ],
  getData: (key, vars, api) =>
    api.siteManager.listAllUsers(
      vars.page,
      {
        automated: vars.automated,
        role: vars.role,
        roles: vars.roles,
        status: vars.status,
      },
      {
        direction: vars.asc ? 'asc' : 'desc',
        name: vars.sort || 'id',
      }
    ),
});
