import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'react-query';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import { ModalButton } from '../../../shared/components/Modal';
import { useApi } from '../../../shared/hooks/use-api';
import { SimpleTable } from '../../../shared/layout/SimpleTable';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';
import { WidePage } from '../../../shared/layout/WidePage';
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { SortableTableHeader } from '../../../shared/layout/SortableTableHeader';
import { useLocationState } from '../../../shared/hooks/use-location-state';

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'label',
    header: 'Label',
    enableSorting: false,
  },
  {
    accessorKey: 'client_id',
    header: 'Client ID',
    enableSorting: false,
    cell: info => <code>{info.getValue() as string}</code>,
  },
  {
    accessorKey: 'client_secret',
    header: 'Client secret',
    enableSorting: false,
    cell: () => <code>********</code>,
  },
  {
    accessorKey: 'user_name',
    header: 'User',
    enableSorting: false,
    cell: info => {
      const row = info.row.original;
      return `${row.user_name} (${row.user_id})`;
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    enableSorting: true,
    cell: info => <TimeAgo date={new Date(info.getValue() as string)} />,
  },
  {
    accessorKey: 'last_used',
    header: 'Last used',
    enableSorting: false,
    cell: info => (info.getValue() ? <TimeAgo date={new Date(info.getValue() as string)} /> : 'never'),
  },
  {
    accessorKey: 'scope',
    header: 'Scope',
    enableSorting: false,
    cell: info => <code>{(info.getValue() as string[]).join(' ')}</code>,
  },
  {
    id: 'actions',
    header: '',
    cell: info => {
      const key = info.row.original;
      return (
        <ModalButton
          title={'Are you sure you want to delete this key'}
          render={() => <p>You will no longer be able to use this API key</p>}
          renderFooter={({ close }) => (
            <ButtonRow $noMargin style={{ margin: '0 0 0 auto' }}>
              <Button
                $error
                disabled={info.table.options.meta?.isDeleting}
                onClick={() => {
                  info.table.options.meta?.onDelete(key.client_id).then(close);
                }}
              >
                Delete
              </Button>
            </ButtonRow>
          )}
        >
          <Button $error disabled={info.table.options.meta?.isDeleting}>
            Delete
          </Button>
        </ModalButton>
      );
    },
  },
];

export const ListApiKeys: React.FC = () => {
  const { t } = useTranslation();
  const api = useApi();
  const { data, refetch } = useQuery(['list-api-keys', {}], () => {
    return api.listApiKeys();
  });

  const [deleteKey, deleteKeyStatus] = useMutation(async (clientId: string) => {
    await api.deleteApiKey(clientId);
    await refetch();
  });

  const [query, setQuery, { onSortingChange, sortingState }] = useLocationState();

  const table = useReactTable({
    data: data ? data.keys : [],
    columns,
    state: { sorting: sortingState },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      isDeleting: deleteKeyStatus.isLoading,
      onDelete: deleteKey,
    },
  });

  return (
    <>
      <AdminHeader
        title={t('Generate API Keys')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'API Keys', link: '/global/api-keys' },
        ]}
      />
      <WidePage>
        <ButtonRow>
          <Button $primary as={HrefLink} href={`/global/api-keys/create`}>
            Create key
          </Button>
        </ButtonRow>
        <SimpleTable.Table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <SimpleTable.Row key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <SimpleTable.Header
                    data-interactive={header.column.getCanSort()}
                    data-pinned={header.column.getIsSorted() !== false}
                    key={header.id}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    style={{
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <SortableTableHeader header={header}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </SortableTableHeader>
                  </SimpleTable.Header>
                ))}
              </SimpleTable.Row>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <SimpleTable.Row key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <SimpleTable.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </SimpleTable.Cell>
                ))}
              </SimpleTable.Row>
            ))}
          </tbody>
        </SimpleTable.Table>
      </WidePage>
    </>
  );
};
