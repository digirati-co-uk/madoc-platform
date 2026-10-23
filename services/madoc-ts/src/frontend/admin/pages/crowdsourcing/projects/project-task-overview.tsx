import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { Pagination } from '../../../../shared/components/Pagination';
import { Status } from '../../../../shared/atoms/Status';
import {
  cachedCanvasCount,
  changeOverviewQuery,
  OverviewQuery,
  OverviewTask,
  OVERVIEW_STATUS_FILTERS,
  overviewSearch,
  overviewTaskLink,
  taskDate,
} from './project-task-query';

interface ProjectTaskOverviewProps {
  projectId: number;
  parentId?: string;
  tasks: OverviewTask[];
  pagination: { page: number; totalPages: number; totalResults: number };
  query: OverviewQuery;
  stale: boolean;
}

export function ProjectTaskOverview({
  projectId,
  parentId,
  tasks,
  pagination,
  query,
  stale,
}: ProjectTaskOverviewProps) {
  const { t } = useTranslation();
  const base = `/projects/${projectId}/tasks${parentId ? `/${parentId}` : ''}`;
  const href = (change: Partial<Omit<OverviewQuery, 'page'>>) =>
    base + overviewSearch(changeOverviewQuery(query, change));
  const sortHeader = (field: OverviewQuery['sortField'], label: string) => (
    <th
      scope="col"
      className="px-3 py-2 text-left"
      aria-sort={query.sortField === field ? (query.sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      <Link
        to={href({
          sortField: field,
          sortDirection: query.sortField === field && query.sortDirection === 'desc' ? 'asc' : 'desc',
        })}
        className="hover:underline"
      >
        {t(label)}{' '}
        <span aria-hidden="true">{query.sortField === field ? (query.sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
      </Link>
    </th>
  );

  return (
    <section className={`mt-4 ${stale ? 'opacity-60' : ''}`} aria-label={t('Crowdsourcing overview')} aria-busy={stale}>
      <nav aria-label={t('Filter by task status')} className="mb-3 flex flex-wrap gap-2">
        {OVERVIEW_STATUS_FILTERS.map(filter => (
          <Link
            key={filter.key}
            to={href({ statusKey: filter.key })}
            aria-current={query.statusKey === filter.key ? 'true' : undefined}
            className={`rounded-full border px-3 py-1 text-sm ${query.statusKey === filter.key ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 text-slate-700'}`}
          >
            {t(filter.label)}
          </Link>
        ))}
      </nav>
      {tasks.length ? (
        <div className="overflow-x-auto rounded border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">{t('Crowdsourcing tasks for this project')}</caption>
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-3 py-2 text-left">
                  {t('Resource')}
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  {t('Canvases')}
                </th>
                {sortHeader('status', 'Task status')}
                {sortHeader('modified_at', 'Task updated')}
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => {
                const subject = task.metadata?.subject;
                const count = cachedCanvasCount(task);
                const updated = taskDate(task.modified_at);
                return (
                  <tr key={task.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        {subject?.thumbnail ? (
                          <img src={subject.thumbnail} alt="" className="h-10 w-10 rounded object-cover" />
                        ) : null}
                        <Link
                          to={overviewTaskLink(projectId, task.id, query)}
                          className="font-medium text-blue-700 hover:underline"
                        >
                          {subject?.label ? <LocaleString>{subject.label}</LocaleString> : task.name}
                        </Link>
                        {subject?.type && subject.type !== 'manifest' ? (
                          <span className="text-xs text-slate-500">{t(subject.type)}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {typeof count === 'number' ? (
                        <span title={t('Cached canvas count from import; may be out of date')}>{count}</span>
                      ) : (
                        <span aria-label={t('Canvas count unavailable')}>—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-1">
                        <Status status={task.status ?? 0} text={t(task.status_text || 'unknown')} />
                        <span>{t(task.status_text || 'unknown')}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {updated ? (
                        <time dateTime={updated.toISOString()} title={updated.toLocaleString()}>
                          {updated.toLocaleDateString()}
                        </time>
                      ) : (
                        <span aria-label={t('Date unavailable')}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-6 text-center text-slate-600">
          {query.statusKey === 'all' ? t('Nothing contributed yet') : t('No tasks match this filter')}
        </p>
      )}
      <p role="status" className="mt-2 text-sm text-slate-600">
        {t('Showing {{shown}} of {{total}} tasks', { shown: tasks.length, total: pagination.totalResults })}
      </p>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        stale={stale}
        extraQuery={Object.fromEntries(new URLSearchParams(overviewSearch(query)))}
      />
      <p className="text-xs text-slate-500">
        {t('Status and date describe the task record, not the latest contribution. Canvas counts are cached.')}
      </p>
    </section>
  );
}
