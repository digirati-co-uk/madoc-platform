/** @jest-environment node */
import cache from 'memory-cache';
import { canvasModelExport } from '../../../src/extensions/project-export/export-configs/canvas/canvas-model-export';
import { projectCsvContributionsExport } from '../../../src/extensions/project-export/export-configs/project/project-cvs-contributions-export';
import type { ExportDataOptions } from '../../../src/extensions/project-export/types';

afterEach(() => {
  cache.clear();
  jest.useRealTimers();
});

test('canvas field-order lookups reuse recent results and expire after five minutes', async () => {
  jest.useFakeTimers();
  const getProject = jest.fn(async () => ({ template_config: {} }));
  const options = {
    config: {}, context: { type: 'project', id: 98765 },
    api: { getProject, getSiteCanvasPublishedModels: async () => ({ models: [{ rows: [] }, { rows: [] }] }) },
  } as unknown as ExportDataOptions;
  const subject = { type: 'canvas' as const, id: 1 };
  await canvasModelExport.exportData(subject, options);
  await canvasModelExport.exportData(subject, options);
  expect(getProject).toHaveBeenCalledTimes(1);
  jest.advanceTimersByTime(5 * 60 * 1000);
  expect(cache.get('canvas-model-field-order:98765')).toBeNull();
  await canvasModelExport.exportData(subject, options);
  expect(getProject).toHaveBeenCalledTimes(2);
});

test('CSV target metadata is deduplicated within an export and refreshed in the next export', async () => {
  const getCanvasById = jest.fn(async () => ({ canvas: { label: { en: ['Canvas'] }, source_id: 'https://example.test/canvas' } }));
  const options = {
    config: {}, api: {
      getProject: async () => ({ template_config: {} }),
      getProjectFieldsRaw: async () => [1, 2].map(id => ({
        id: String(id), doc_id: 'doc', key: 'field', value: 'value', target: [{ id: 'urn:madoc:canvas:123' }],
      })),
      getCanvasById,
    },
  } as unknown as ExportDataOptions;
  await projectCsvContributionsExport.exportData({ type: 'project', id: 1 }, options);
  expect(getCanvasById).toHaveBeenCalledTimes(1);
  await projectCsvContributionsExport.exportData({ type: 'project', id: 1 }, options);
  expect(getCanvasById).toHaveBeenCalledTimes(2);
});
