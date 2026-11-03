import type { ApiClient } from '../../../../../gateway/api';
import type { BaseTask } from '../../../../../gateway/tasks/base-task';
import type { SubjectSnippet } from '../../../../../extensions/tasks/resolvers/subject-resolver';

export interface OverviewQuery {
  page: number;
  statusKey: string;
  sortField: 'modified_at' | 'status';
  sortDirection: 'asc' | 'desc';
}

export type OverviewTask = Omit<BaseTask, 'metadata'> & {
  id: string;
  metadata?: { subject?: SubjectSnippet | null };
};

export const OVERVIEW_STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: '0,1', label: 'To do' },
  { key: '2', label: 'In progress' },
  { key: '3', label: 'Done' },
  { key: '-1', label: 'Errored' },
];

export function normalizeOverviewQuery(query: { page?: string; status?: string; sort_by?: string }): OverviewQuery {
  const page = Number(query.page);
  const statuses = (query.status || '').split(',');
  const validStatuses = statuses.every(
    value => /^-?\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= -1
  );
  const statusKey = validStatuses ? [...new Set(statuses.map(Number))].sort((a, b) => a - b).join(',') : 'all';
  const [field, direction] = (query.sort_by || '').split(':');
  const validSort = /^(modified_at|status):(asc|desc)$/.test(query.sort_by || '');
  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    statusKey,
    sortField: validSort && field === 'status' ? 'status' : 'modified_at',
    sortDirection: validSort && direction === 'asc' ? 'asc' : 'desc',
  };
}

export function overviewKey(
  params: { id: number; taskId?: string },
  query: Parameters<typeof normalizeOverviewQuery>[0]
): [string, OverviewQuery & { id: number; taskId?: string }] {
  return ['project-tasks', { id: Number(params.id), taskId: params.taskId, ...normalizeOverviewQuery(query) }];
}

export function overviewSearch(query: OverviewQuery): string {
  const params = new URLSearchParams();
  if (query.statusKey !== 'all') params.set('status', query.statusKey);
  params.set('sort_by', `${query.sortField}:${query.sortDirection}`);
  if (query.page > 1) params.set('page', String(query.page));
  return `?${params.toString()}`;
}

export function changeOverviewQuery(query: OverviewQuery, change: Partial<Omit<OverviewQuery, 'page'>>): OverviewQuery {
  return { ...query, ...change, page: 1 };
}

export function overviewTaskLink(projectId: number, taskId: string, query: OverviewQuery): string {
  return `/projects/${projectId}/tasks/${taskId}${overviewSearch(changeOverviewQuery(query, {}))}`;
}

export function overviewRequest(parentId: string, rootId: string, query: OverviewQuery) {
  return {
    parent_task_id: parentId,
    root_task_id: rootId,
    detail: true,
    per_page: 20,
    status: query.statusKey === 'all' ? undefined : query.statusKey.split(',').map(Number),
    sort_by: `${query.sortField}:${query.sortDirection}`,
  };
}

export function cachedCanvasCount(task: OverviewTask): number | undefined {
  return task.metadata?.subject?.type === 'manifest' ? task.metadata.subject.itemsTotal : undefined;
}

export function taskDate(value: number | string | undefined): Date | undefined {
  if (value === undefined || value === '') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function loadProjectTaskOverview(
  api: Pick<ApiClient, 'getTask' | 'getTasks' | 'getProject'>,
  vars: OverviewQuery & { id: number; taskId?: string }
) {
  const project = await api.getProject(vars.id);
  const parent = await api.getTask(vars.taskId || project.task_id, { detail: true, page: 1 });
  // Detailed task views retain their existing complete subtask lists.
  if (parent.type === 'crowdsourcing-task' || parent.type === 'crowdsourcing-canvas-task') {
    return { parent: await api.getTask(parent.id, { all: true, detail: true }), listing: undefined, query: vars };
  }
  const listing = await api.getTasks<OverviewTask>(vars.page, overviewRequest(parent.id, project.task_id, vars));
  return { parent, listing, query: vars };
}
