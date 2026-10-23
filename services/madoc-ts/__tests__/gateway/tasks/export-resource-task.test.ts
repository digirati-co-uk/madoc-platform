/** @jest-environment node */
import { promises as fs } from 'fs';
import { join } from 'path';
import AdmZip from 'adm-zip';
import {
  createTask,
  getManifestCsvCompletion,
  jobHandler,
  type ExportResourceTask,
} from '../../../src/gateway/tasks/export-resource-task';
import { getSiteApi } from '../../../src/gateway/helpers/get-site-api';
import { EXPORT_PATH, STORAGE_API_PATH } from '../../../src/paths';
import type { ApiClient } from '../../../src/gateway/api';
import type { ExportPlan, ExportResourceRequest } from '../../../src/extensions/project-export/types';

jest.mock('../../../src/gateway/helpers/get-site-api', () => ({ getSiteApi: jest.fn() }));
jest.mock('../../../src/paths', () => ({
  EXPORT_PATH: require('path').join(require('os').tmpdir(), `madoc-export-test-${process.pid}`, 'temporary'),
  STORAGE_API_PATH: require('path').join(require('os').tmpdir(), `madoc-export-test-${process.pid}`, 'storage'),
}));

const plan: ExportPlan = { project: [], manifest: [['manifest-csv-contributions-export', {}]], canvas: [] };
function request(): ExportResourceRequest {
  return {
    subject: { type: 'project', id: 7 },
    context: { type: 'project', id: 7 },
    subjectExports: [],
    exportPlan: plan,
    output: {
      type: 'zip',
      path: 'projects/7',
      fileName: 'test.zip',
      options: { tempDir: 'test' },
    },
  };
}

function child(id: number, status = 3) {
  return {
    id: `child-${id}`,
    type: 'export-resource-task',
    name: 'Export',
    status,
    subject: `urn:madoc:manifest:${id}`,
    state: { outputPaths: [`/manifests/${id}/csv/7/contributions.csv`] },
  };
}

afterEach(async () => {
  jest.clearAllMocks();
  await fs.rm(EXPORT_PATH, { recursive: true, force: true });
  await fs.rm(STORAGE_API_PATH, { recursive: true, force: true });
});

test('completion waits for every expected sibling and reports failed or missing outputs', () => {
  const task = { ...createTask(request(), 1, 5), state: { expectedSubtasks: 2 }, subtasks: [child(1)] };
  expect(getManifestCsvCompletion(task)).toBeUndefined();
  task.subtasks.push(child(2, 1));
  expect(getManifestCsvCompletion(task)).toBeUndefined();
  task.subtasks[1].status = -1;
  expect(getManifestCsvCompletion(task)).toEqual({ failedResources: ['urn:madoc:manifest:2'] });
  task.subtasks[1].status = 3;
  task.subtasks[1].state.outputPaths = [];
  expect(getManifestCsvCompletion(task)).toEqual({ failedResources: ['urn:madoc:manifest:2'] });
  task.subtasks[1].state.outputPaths = ['/manifests/2/csv/7/contributions.csv'];
  expect(getManifestCsvCompletion(task)).toEqual({ failedResources: [] });
});

test('queues all manifest children together with project context and disposes the scoped API', async () => {
  const task = { ...createTask(request(), 1, 5), id: 'root' };
  const scopedApi = {
    projectExport: { getAllDefinitions: () => [] },
    getProjectStructure: jest.fn(async () => ({
      items: [
        { id: 1, type: 'manifest' },
        { id: 2, type: 'manifest' },
      ],
    })),
    dispose: jest.fn(),
  };
  jest.mocked(getSiteApi).mockResolvedValue(scopedApi as unknown as ApiClient);
  const api = {
    acceptTask: jest.fn(),
    getTask: jest.fn(async () => task),
    updateTask: jest.fn(),
    addSubtasks: jest.fn(),
  };
  await jobHandler('created', 'root', api as unknown as ApiClient);
  const children = api.addSubtasks.mock.calls[0] as unknown as [ExportResourceTask[], string];
  expect(children[0].map(next => next.subject)).toEqual(['urn:madoc:manifest:1', 'urn:madoc:manifest:2']);
  for (const next of children[0]) {
    expect(next.parameters[0]).toMatchObject({
      context: { type: 'project', id: 7 },
      output: { type: 'disk', directory: 'test' },
      subjectExports: plan.manifest,
    });
  }
  expect(api.updateTask).toHaveBeenCalledWith('root', { state: { expectedSubtasks: 2, outputPaths: [] } });
  expect(scopedApi.dispose).toHaveBeenCalledTimes(1);
});

test.each([undefined, 404])(
  'a manifest export failure reaches the worker failure listener (HTTP status %p)',
  async status => {
    const req = request();
    req.subject = { type: 'manifest', id: 2 };
    req.subjectExports = plan.manifest;
    const task = { ...createTask(req, 1, 5), id: 'failed' };
    const error = Object.assign(new Error('Manifest data unavailable'), { status });
    const scopedApi = {
      projectExport: {
        getAllDefinitions: () => [
          { type: 'manifest-csv-contributions-export', exportData: jest.fn().mockRejectedValue(error) },
        ],
      },
      dispose: jest.fn(),
    };
    jest.mocked(getSiteApi).mockResolvedValue(scopedApi as unknown as ApiClient);
    const api = { acceptTask: jest.fn(), getTask: jest.fn(async () => task), updateTask: jest.fn() };
    const result = jobHandler('created', 'failed', api as unknown as ApiClient);
    if (status === 404) {
      await expect(result).rejects.toMatchObject({
        message: 'CSV export resource not found: Manifest data unavailable',
      });
    } else {
      await expect(result).rejects.toBe(error);
    }
    expect(scopedApi.dispose).toHaveBeenCalledTimes(1);
    expect(api.updateTask).not.toHaveBeenCalled();
  }
);

test('writes a manifest CSV and records it before queuing canvas children', async () => {
  const req = request();
  req.subject = { type: 'manifest', id: 1 };
  req.subjectExports = plan.manifest;
  req.exportPlan = { ...plan, canvas: [['canvas-model-export', {}]] };
  req.output = { type: 'disk', directory: 'test' };
  const task = { ...createTask(req, 1, 5), id: 'manifest' };
  const path = '/manifests/1/csv/7/contributions.csv';
  const scopedApi = {
    projectExport: {
      getAllDefinitions: () => [
        {
          type: 'manifest-csv-contributions-export',
          exportData: async () => [{ path, content: { type: 'text', value: 'name\nAlice\n' } }],
        },
      ],
    },
    getManifestStructure: jest.fn(async () => ({ items: [{ id: 10 }] })),
    dispose: jest.fn(),
  };
  jest.mocked(getSiteApi).mockResolvedValue(scopedApi as unknown as ApiClient);
  const updateTask = jest.fn();
  const api = {
    acceptTask: jest.fn(),
    getTask: jest.fn(async () => task),
    updateTask,
    addSubtasks: jest.fn(async () => {
      expect(await fs.readFile(join(EXPORT_PATH, 'test', path), 'utf-8')).toBe('name\nAlice\n');
      expect(updateTask).toHaveBeenCalledWith('manifest', { state: { expectedSubtasks: 1, outputPaths: [path] } });
    }),
  };
  await jobHandler('created', 'manifest', api as unknown as ApiClient);
  expect(api.addSubtasks).toHaveBeenCalledTimes(1);
  expect(scopedApi.dispose).toHaveBeenCalledTimes(1);
});

// Task API contract verified in tasks-api/src/routes/update-single-task.ts and
// src/utility/dispatch-update-subtask-status.ts: every status PATCH emits an own
// status event (including unchanged status), aggregate events require unanimity.
// Do not invent aggregate events for mixed siblings in these regression tests.
test.each([
  [3, -1],
  [-1, 3],
])('real task event semantics settle mixed siblings in order %p', async (first, last) => {
  const root = { ...createTask(request(), 1, 5), id: 'root', state: { expectedSubtasks: 2 } };
  const children = [1, 2].map(id => {
    const req = request();
    req.subject = { type: 'manifest', id };
    req.output = { type: 'disk', directory: 'test' };
    return { ...createTask(req, 1, 5), ...child(id, 1), parent_task: 'root' };
  });
  const tasks: Record<string, ExportResourceTask> = {
    root,
    ...Object.fromEntries(children.map(next => [next.id, next])),
  };
  const pending: Array<{ name: string; id: string }> = [];
  const aggregateEvents: string[] = [];
  const emit = (task: ExportResourceTask, name: string) => {
    if (task.events?.includes(`madoc-ts.${name}`)) pending.push({ name, id: task.id! });
  };
  const userApi = { dispose: jest.fn(), notifications: { createNotification: jest.fn() } };
  const api = {
    asUser: jest.fn(() => userApi),
    getTask: jest.fn(
      async (id: string) =>
        JSON.parse(
          JSON.stringify({
            ...tasks[id],
            ...(id === 'root' ? { subtasks: children } : {}),
          })
        ) as ExportResourceTask
    ),
    updateTask: jest.fn(async (id: string, patch: Partial<ExportResourceTask>) => {
      const task = tasks[id];
      Object.assign(task, { ...patch, state: { ...task.state, ...patch.state } });
      if (patch.status !== undefined) {
        emit(task, `status.${patch.status}`);
        if (task.parent_task && new Set(children.map(next => next.status)).size === 1) {
          const event = `subtask_type_status.export-resource-task.${patch.status}`;
          aggregateEvents.push(event);
          emit(root, event);
        }
      }
    }),
  };
  const successId = first === 3 ? 1 : 2;
  await fs.mkdir(join(EXPORT_PATH, `test/manifests/${successId}/csv/7`), { recursive: true });
  await fs.writeFile(join(EXPORT_PATH, `test/manifests/${successId}/csv/7/contributions.csv`), 'name\nAlice\n');
  await api.updateTask('child-1', { status: first as 3 | -1 });
  while (pending.length) {
    const event = pending.shift()!;
    await jobHandler(event.name, event.id, api as unknown as ApiClient);
  }
  expect(root.status).toBe(0);
  await api.updateTask('child-2', { status: last as 3 | -1 });
  while (pending.length) {
    const event = pending.shift()!;
    await jobHandler(event.name, event.id, api as unknown as ApiClient);
  }
  expect(aggregateEvents).toEqual([]);
  expect(root.status).toBe(3);
  const failedId = first === -1 ? 1 : 2;
  expect(root.state).toMatchObject({ didError: true, failedResources: [`urn:madoc:manifest:${failedId}`] });
  expect(children[failedId - 1].status).toBe(-1);
  const zip = new AdmZip(join(STORAGE_API_PATH, 'urn:madoc:site:5/export/projects/7/test.zip'));
  expect(zip.readAsText(`test/manifests/${successId}/csv/7/contributions.csv`)).toBe('name\nAlice\n');
  expect(zip.readAsText('test/README-errors.txt')).toContain(`urn:madoc:manifest:${failedId}`);
});

test('legacy plans without manifest exports keep their success and failure handling', async () => {
  const req = request();
  req.exportPlan = { project: [] } as unknown as ExportPlan;
  const task = { ...createTask(req, 1, 5), id: 'legacy' };
  const api = { getTask: jest.fn(async () => task), updateTask: jest.fn() };
  await jobHandler('subtask_type_status.export-resource-task.-1', 'legacy', api as unknown as ApiClient);
  expect(api.updateTask).not.toHaveBeenCalled();
  await jobHandler('subtask_type_status.export-resource-task.3', 'legacy', api as unknown as ApiClient);
  expect(api.updateTask).toHaveBeenCalledWith('legacy', { status: 3, status_text: 'completed' });
});

test('partial ZIP keeps successful files, explains missing resources and disposes the notification API', async () => {
  const task = {
    ...createTask(request(), 1, 5),
    id: 'root',
    state: {
      didError: true,
      failedResources: ['urn:madoc:manifest:2'],
    },
  };
  await fs.mkdir(join(EXPORT_PATH, 'test/manifests/1/csv/7'), { recursive: true });
  await fs.writeFile(join(EXPORT_PATH, 'test/manifests/1/csv/7/contributions.csv'), 'name\nAlice\n');
  const userApi = { dispose: jest.fn(), notifications: { createNotification: jest.fn() } };
  const api = { getTask: jest.fn(async () => task), asUser: jest.fn(() => userApi), updateTask: jest.fn() };
  await jobHandler('status.3', 'root', api as unknown as ApiClient);
  const zip = new AdmZip(join(STORAGE_API_PATH, 'urn:madoc:site:5/export/projects/7/test.zip'));
  expect(zip.readAsText('test/manifests/1/csv/7/contributions.csv')).toBe('name\nAlice\n');
  expect(zip.readAsText('test/README-errors.txt')).toContain('urn:madoc:manifest:2');
  expect(userApi.dispose).toHaveBeenCalledTimes(1);
  expect(userApi.notifications.createNotification).toHaveBeenCalledTimes(1);
});

test('disposes the notification API if archive notification fails', async () => {
  const task = { ...createTask(request(), 1, 5), id: 'root' };
  const error = new Error('Notification unavailable');
  const userApi = { dispose: jest.fn(), notifications: { createNotification: jest.fn().mockRejectedValue(error) } };
  const api = { getTask: jest.fn(async () => task), asUser: jest.fn(() => userApi), updateTask: jest.fn() };
  await expect(jobHandler('status.3', 'root', api as unknown as ApiClient)).rejects.toBe(error);
  expect(userApi.dispose).toHaveBeenCalledTimes(1);
});

test('overlapping stale-parent completion events and repeated PATCH 3 cannot replace a published ZIP', async () => {
  const task = {
    ...createTask(request(), 1, 5),
    id: 'root',
    state: { expectedSubtasks: 2 },
    subtasks: [child(1), child(2, -1)],
  };
  await fs.mkdir(join(EXPORT_PATH, 'test/manifests/1/csv/7'), { recursive: true });
  await fs.writeFile(join(EXPORT_PATH, 'test/manifests/1/csv/7/contributions.csv'), 'name\nAlice\n');
  let reads = 0;
  let releaseReads!: () => void;
  const bothRead = new Promise<void>(resolve => {
    releaseReads = resolve;
  });
  const ownStatusEvents: string[] = [];
  const userApi = { dispose: jest.fn(), notifications: { createNotification: jest.fn() } };
  const api = {
    getTask: jest.fn(async () => {
      const snapshot = JSON.parse(JSON.stringify(task)) as ExportResourceTask;
      if (reads++ < 2) {
        if (reads === 2) releaseReads();
        await bothRead;
      }
      return snapshot;
    }),
    updateTask: jest.fn(async (_id: string, patch: Partial<ExportResourceTask>) => {
      Object.assign(task, { ...patch, state: { ...task.state, ...patch.state } });
      if (patch.status !== undefined) ownStatusEvents.push(`status.${patch.status}`);
    }),
    asUser: jest.fn(() => userApi),
  };
  // Both reconciliation calls read status 0 before either can PATCH 3.
  await Promise.all([
    jobHandler('subtask_type_status.export-resource-task.3', 'root', api as unknown as ApiClient),
    jobHandler('subtask_type_status.export-resource-task.3', 'root', api as unknown as ApiClient),
  ]);
  expect(ownStatusEvents).toEqual(['status.3', 'status.3']);
  const realLink = fs.link.bind(fs);
  let candidates = 0;
  let releaseLinks!: () => void;
  const bothCandidatesWritten = new Promise<void>(resolve => {
    releaseLinks = resolve;
  });
  const links = jest.spyOn(fs, 'link').mockImplementation(async (source, destination) => {
    if (++candidates === 2) releaseLinks();
    await bothCandidatesWritten;
    return realLink(source, destination);
  });
  try {
    await Promise.all(ownStatusEvents.map(name => jobHandler(name, 'root', api as unknown as ApiClient)));
  } finally {
    links.mockRestore();
  }
  expect(candidates).toBe(2);
  const outputFile = join(STORAGE_API_PATH, 'urn:madoc:site:5/export/projects/7/test.zip');
  const bytes = await fs.readFile(outputFile);
  const zip = new AdmZip(bytes);
  expect(zip.readAsText('test/manifests/1/csv/7/contributions.csv')).toBe('name\nAlice\n');
  expect(zip.readAsText('test/README-errors.txt')).toContain('urn:madoc:manifest:2');
  await expect(fs.stat(join(EXPORT_PATH, 'test'))).rejects.toMatchObject({ code: 'ENOENT' });
  // Replay after inputs were removed must leave identical archive bytes and state.
  await jobHandler('status.3', 'root', api as unknown as ApiClient);
  expect(await fs.readFile(outputFile)).toEqual(bytes);
  expect(task.state).not.toHaveProperty('empty');
  expect(userApi.notifications.createNotification).toHaveBeenCalledTimes(1);
});

test('failed atomic publication keeps source CSVs for retry and exposes no incomplete ZIP', async () => {
  const task = { ...createTask(request(), 1, 5), id: 'root' };
  const inputFile = join(EXPORT_PATH, 'test/manifests/1/csv/7/contributions.csv');
  await fs.mkdir(join(EXPORT_PATH, 'test/manifests/1/csv/7'), { recursive: true });
  await fs.writeFile(inputFile, 'name\nAlice\n');
  const userApi = { dispose: jest.fn(), notifications: { createNotification: jest.fn() } };
  const api = { getTask: jest.fn(async () => task), asUser: jest.fn(() => userApi), updateTask: jest.fn() };
  const error = Object.assign(new Error('Publication failed'), { code: 'EIO' });
  const links = jest.spyOn(fs, 'link').mockRejectedValue(error);
  try {
    await expect(jobHandler('status.3', 'root', api as unknown as ApiClient)).rejects.toBe(error);
  } finally {
    links.mockRestore();
  }
  const outputDir = join(STORAGE_API_PATH, 'urn:madoc:site:5/export/projects/7');
  expect(await fs.readdir(outputDir)).toEqual([]);
  expect(await fs.readFile(inputFile, 'utf-8')).toBe('name\nAlice\n');
  expect(userApi.notifications.createNotification).not.toHaveBeenCalled();
  await jobHandler('status.3', 'root', api as unknown as ApiClient);
  expect(new AdmZip(join(outputDir, 'test.zip')).readAsText('test/manifests/1/csv/7/contributions.csv')).toBe(
    'name\nAlice\n'
  );
});
