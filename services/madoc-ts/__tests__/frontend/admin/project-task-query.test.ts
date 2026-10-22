import {
  normalizeOverviewQuery,
  overviewKey,
  overviewRequest,
  overviewSearch,
  changeOverviewQuery,
  cachedCanvasCount,
  taskDate,
  OverviewTask,
  loadProjectTaskOverview,
  overviewTaskLink,
} from '../../../src/frontend/admin/pages/crowdsourcing/projects/project-task-query';

const task: OverviewTask = {
  id: 'manifest',
  name: 'Manifest',
  type: 'crowdsourcing-manifest-task',
  subject: 'urn:manifest:1',
  status: 2,
  status_text: 'max contributors',
};

describe('project task overview', () => {
  test('normalizes valid zero, custom and comma-separated statuses and rejects invalid input', () => {
    expect(normalizeOverviewQuery({ status: '0' }).statusKey).toBe('0');
    expect(normalizeOverviewQuery({ status: '2,0,2,5' }).statusKey).toBe('0,2,5');
    expect(normalizeOverviewQuery({ page: '-1', status: '0,oops', sort_by: 'name:asc' })).toEqual({
      page: 1,
      statusKey: 'all',
      sortField: 'modified_at',
      sortDirection: 'desc',
    });
    expect(normalizeOverviewQuery({ page: '2.5' }).page).toBe(1);
    expect(normalizeOverviewQuery({ page: '3', sort_by: 'status:asc' })).toMatchObject({
      page: 3,
      sortField: 'status',
      sortDirection: 'asc',
    });
  });

  test('keys distinguish scope, paging, status and sorting; changed filters reset page', () => {
    const key = overviewKey({ id: 1 }, { page: '2', status: '0' });
    for (const candidate of [
      overviewKey({ id: 2 }, { page: '2', status: '0' }),
      overviewKey({ id: 1, taskId: 'nested' }, { page: '2', status: '0' }),
      overviewKey({ id: 1 }, { page: '1', status: '0' }),
      overviewKey({ id: 1 }, { page: '2', status: '1' }),
      overviewKey({ id: 1 }, { page: '2', status: '0', sort_by: 'status:asc' }),
    ])
      expect(candidate).not.toEqual(key);
    const changed = changeOverviewQuery(normalizeOverviewQuery({ page: '8' }), { statusKey: '0' });
    expect(changed.page).toBe(1);
    expect(new URLSearchParams(overviewSearch(changed)).get('status')).toBe('0');
  });

  test('requests bounded immediate children with explicit scope and sorting', async () => {
    const getTasks = jest
      .fn()
      .mockResolvedValue({ tasks: [task], pagination: { page: 2, totalPages: 3, totalResults: 42 } });
    const getTask = jest.fn().mockResolvedValue({ ...task, id: 'parent' });
    const api = { getProject: jest.fn().mockResolvedValue({ task_id: 'root' }), getTask, getTasks };
    const vars = {
      id: 1,
      taskId: 'parent',
      ...normalizeOverviewQuery({ page: '2', status: '0', sort_by: 'status:asc' }),
    };
    const result = await loadProjectTaskOverview(api as unknown as Parameters<typeof loadProjectTaskOverview>[0], vars);
    expect(getTask).toHaveBeenCalledTimes(1);
    expect(getTask).toHaveBeenCalledWith('parent', { detail: true, page: 1 });
    expect(getTasks).toHaveBeenCalledWith(2, {
      parent_task_id: 'parent',
      root_task_id: 'root',
      detail: true,
      per_page: 20,
      status: [0],
      sort_by: 'status:asc',
    });
    expect(result.listing?.pagination.totalResults).toBe(42);
    expect(overviewRequest('parent', 'root', vars)).not.toHaveProperty('all');
    expect(result.listing?.tasks[0].status_text).toBe('max contributors');
  });

  test.each([
    ['child', 'manifest'],
    ['parent', 'root'],
  ])('navigates to %s from page three at page one, retaining filter and sort', async (_direction, targetId) => {
    const query = normalizeOverviewQuery({ page: '3', status: '0,1', sort_by: 'status:asc' });
    const link = overviewTaskLink(1, targetId, query);
    expect(link.split('?')[0]).toBe(`/projects/1/tasks/${targetId}`);
    const childQuery = normalizeOverviewQuery(Object.fromEntries(new URLSearchParams(link.split('?')[1])));
    expect(childQuery).toEqual({ ...query, page: 1 });
    const getTasks = jest.fn().mockResolvedValue({ tasks: [task] });
    const api = {
      getProject: jest.fn().mockResolvedValue({ task_id: 'root' }),
      getTask: jest.fn().mockResolvedValue({ ...task, id: targetId }),
      getTasks,
    };
    await loadProjectTaskOverview(api as unknown as Parameters<typeof loadProjectTaskOverview>[0], {
      id: 1,
      taskId: targetId,
      ...childQuery,
    });
    expect(getTasks).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        parent_task_id: targetId,
        status: [0, 1],
        sort_by: 'status:asc',
      })
    );
    expect(query.page).toBe(3);
  });

  test('retains complete contribution detail rather than replacing it with overview', async () => {
    const getTask = jest.fn().mockResolvedValue({ ...task, id: 'contribution', type: 'crowdsourcing-task' });
    const getTasks = jest.fn();
    const api = { getTask, getTasks, getProject: jest.fn().mockResolvedValue({ task_id: 'root' }) };
    const result = await loadProjectTaskOverview(api as unknown as Parameters<typeof loadProjectTaskOverview>[0], {
      id: 1,
      taskId: 'contribution',
      ...normalizeOverviewQuery({}),
    });
    expect(result.listing).toBeUndefined();
    expect(getTask).toHaveBeenLastCalledWith('contribution', { all: true, detail: true });
    expect(getTasks).not.toHaveBeenCalled();
  });

  test('cached counts distinguish absent, zero and collection counts; dates reject missing/invalid', () => {
    expect(cachedCanvasCount(task)).toBeUndefined();
    const subject = { id: 1, type: 'manifest' as const, label: { en: ['Example'] }, itemsTotal: 0 };
    expect(cachedCanvasCount({ ...task, metadata: { subject } })).toBe(0);
    expect(
      cachedCanvasCount({ ...task, metadata: { subject: { ...subject, type: 'collection', itemsTotal: 20 } } })
    ).toBeUndefined();
    expect(taskDate(undefined)).toBeUndefined();
    expect(taskDate('invalid')).toBeUndefined();
    expect(taskDate(0)?.getTime()).toBe(0);
  });
});
