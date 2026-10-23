import React, { useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { SlowRequests } from '../../../../../types/slow-requests';
import { Input } from '../../../../shared/form/Input';
import { SimpleTable } from '../../../../shared/layout/SimpleTable';
import { SortableTableHeader } from '../../../../shared/layout/SortableTableHeader';

type Row = SlowRequests[string];
const sec = (ms: number) => `${(ms / 1000).toFixed(2)}s`;

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'key', header: 'Route', enableSorting: true },
  { accessorKey: 'count', header: 'Count', enableSorting: true },
  { accessorKey: 'avg', header: 'Average time', enableSorting: true, cell: i => sec(i.getValue() as number) },
  { accessorKey: 'slowest', header: 'Max time', enableSorting: true, cell: i => sec(i.getValue() as number) },
];

export function SlowRequestsTable(props: {
  slowRequests: SlowRequests;
  instances?: { id: string; startedAt: string; observedAt: string }[];
}) {
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'slowest', desc: true }]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return Object.values(props.slowRequests || {}).filter(r => !q || r.key.toLowerCase().includes(q));
  }, [props.slowRequests, search]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="m-0 text-base font-semibold">Slow requests</h3>
        <div className="w-full max-w-sm">
          <Input
            aria-label="Search request routes"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search routes…"
          />
        </div>
      </div>
      <p className="mb-2 text-sm text-gray-600">
        Aggregated across {props.instances?.length ?? 'all'} instance{props.instances?.length === 1 ? '' : 's'}. Sampled
        every 5 seconds. Each instance retains up to 50 routes; counters reset on restart.
      </p>
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <SimpleTable.Table>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <SimpleTable.Row key={hg.id}>
                {hg.headers.map(header => (
                  <SimpleTable.Header
                    key={header.id}
                    data-interactive={header.column.getCanSort()}
                    data-pinned={header.column.getIsSorted() !== false}
                    onClick={header.column.getToggleSortingHandler()}
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : 'none'
                    }
                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={event => {
                        event.stopPropagation();
                        header.column.toggleSorting();
                      }}
                    >
                      <SortableTableHeader header={header}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </SortableTableHeader>
                    </button>
                  </SimpleTable.Header>
                ))}
              </SimpleTable.Row>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <SimpleTable.Row key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <SimpleTable.Cell
                    className={
                      cell.column.id === 'key'
                        ? 'max-w-xl break-words font-mono text-xs'
                        : 'whitespace-nowrap tabular-nums'
                    }
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </SimpleTable.Cell>
                ))}
              </SimpleTable.Row>
            ))}
            {rows.length === 0 ? (
              <SimpleTable.Row>
                <SimpleTable.Cell colSpan={4}>
                  {search ? 'No routes match your search' : 'No slow requests recorded'}
                </SimpleTable.Cell>
              </SimpleTable.Row>
            ) : null}
          </tbody>
        </SimpleTable.Table>
      </div>
      <p className="mt-2 text-sm text-gray-500">{rows.length} routes shown</p>
      {props.instances?.length ? (
        <details className="mt-2 text-sm text-gray-500">
          <summary className="cursor-pointer">Reporting instances</summary>
          <ul className="mt-1 space-y-1 font-mono text-xs">
            {props.instances.map(instance => (
              <li key={instance.id}>{instance.id}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}
