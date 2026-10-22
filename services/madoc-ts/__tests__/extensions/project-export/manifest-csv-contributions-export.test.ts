/** @jest-environment node */
import {
  manifestCsvContributionsExport,
  resetManifestCsvProjectConfiguration,
} from '../../../src/extensions/project-export/export-configs/manifest/manifest-csv-contributions-export';
import { projectCsvContributionsExport } from '../../../src/extensions/project-export/export-configs/project/project-cvs-contributions-export';
import type { ExportDataOptions } from '../../../src/extensions/project-export/types';

function createOptions() {
  const target = (manifest: number) => [
    { id: `urn:madoc:manifest:${manifest}` },
    { id: `urn:madoc:canvas:${manifest * 10}` },
  ];
  const fields = [
    { id: 'age', key: 'age', value: '30', target: target(2) },
    { id: 'old', key: 'name', value: 'Alice', target: target(2) },
    { id: 'new', key: 'name', value: 'Alicia', revises: 'old', target: target(2) },
    { id: 'other', key: 'name', value: 'Bob', target: target(3) },
  ].map(field => ({ model_id: 'model', doc_id: 'doc', ...field }));
  const getProjectFieldsRaw = jest.fn(async () => fields);
  const getManifestById = jest.fn(async (id: number) => ({
    manifest: {
      source: `https://example.test/manifest/${id}`,
      label: { en: [`Manifest ${id}`] },
    },
  }));
  const getCanvasById = jest.fn(async (id: number) => ({
    canvas: {
      source_id: `https://example.test/canvas/${id}`,
      label: { en: [`Canvas ${id}`] },
    },
  }));
  const api = {
    getProject: jest.fn(async () => ({
      template_config: {
        tabular: { model: { columns: [{ id: 'name' }, { id: 'age' }] } },
      },
    })),
    getProjectFieldsRaw,
    getManifestById,
    getCanvasById,
  };
  return {
    api,
    options: {
      api,
      config: { project_id: { uri: 'urn:madoc:project:7' }, entity: 'rows', reviews: true },
    } as unknown as ExportDataOptions,
  };
}

test('scopes at the API boundary and preserves every contribution/revision in configured field order', async () => {
  const { options, api } = createOptions();
  const files = await manifestCsvContributionsExport.exportData({ type: 'manifest', id: 2 }, options);
  expect(api.getProjectFieldsRaw).toHaveBeenCalledWith(7, { entity: 'rows', status: 'all', manifest_id: 2 });
  expect(api.getProject).toHaveBeenCalledWith(7);
  expect(files?.[0].path).toBe('/manifests/2/csv/7/contributions.csv');
  const lines = files?.[0].content.value.trim().split('\n') || [];
  expect(lines).toHaveLength(4);
  const headings = lines[0].split(',');
  const rows = lines
    .slice(1)
    .map(line => Object.fromEntries(line.split(',').map((value, index) => [headings[index], value])));
  expect(rows.map(row => row.madoc_contribution_id)).toEqual(['old', 'new', 'age']);
  expect(rows.map(row => row.contribution_data)).toEqual(['Alice', 'Alicia', '30']);
  expect(rows[1].revises).toBe('old');
  for (const row of rows) {
    expect(row.original_manifest_id).toBe('https://example.test/manifest/2');
    expect(row.original_canvas_id).toBe('https://example.test/canvas/20');
    expect(row.madoc_canvas_id).toBe('20');
    expect(row.capture_model_number).toBe('model');
  }
  expect(api.getManifestById).toHaveBeenCalledTimes(1);
  expect(api.getCanvasById).toHaveBeenCalledTimes(1);
  expect(api.getCanvasById).toHaveBeenCalledWith(20);
});

test('project exports keep their original scope, file path and rows', async () => {
  const { options, api } = createOptions();
  const files = await projectCsvContributionsExport.exportData({ type: 'project', id: 7 }, options);
  expect(api.getProjectFieldsRaw).toHaveBeenCalledWith(7, { entity: 'rows', status: 'all' });
  expect(files?.[0].path).toBe('project-data/contributions.csv');
  expect(files?.[0].content.value.trim().split('\n')).toHaveLength(5);
});

test('uses the project task context, defaults to approved and gives manifests distinct paths', async () => {
  const { options, api } = createOptions();
  options.config = {};
  options.context = { type: 'project', id: 8 };
  const files = await manifestCsvContributionsExport.exportData({ type: 'manifest', id: 3 }, options);
  expect(api.getProjectFieldsRaw).toHaveBeenCalledWith(8, { status: 'approved', manifest_id: 3 });
  expect(files?.[0].path).toBe('/manifests/3/csv/8/contributions.csv');
  expect(files?.[0].content.value).toContain('Bob');
  expect(files?.[0].content.value).not.toContain('Alice');
});

test('requires a project selection in standalone previews and supports project builder defaults', async () => {
  const { options, api } = createOptions();
  options.config = {};
  expect(await manifestCsvContributionsExport.exportData({ type: 'manifest', id: 2 }, options)).toEqual([]);
  expect(api.getProjectFieldsRaw).not.toHaveBeenCalled();
  const config = manifestCsvContributionsExport.hookConfig?.(
    { type: 'project', id: 7 },
    options,
    manifestCsvContributionsExport.configuration
  );
  expect(config?.defaultValues.project_id).toBe('urn:madoc:project:7');
  const manifestConfig = manifestCsvContributionsExport.hookConfig?.(
    { type: 'manifest', id: 2 },
    options,
    manifestCsvContributionsExport.configuration
  );
  expect(manifestConfig?.editor).toMatchObject({
    project_id: {
      dataSource: 'madoc-api://iiif/manifests/2/projects-autocomplete?all=true',
    },
  });
});

test('changing or clearing the project drops the previous entity while retaining review selection', async () => {
  const previous = { project_id: { uri: 'urn:madoc:project:7' }, entity: 'old-entity', reviews: true };
  const next = resetManifestCsvProjectConfiguration(previous, { ...previous, project_id: 'urn:madoc:project:8' });
  expect(next).toEqual({ project_id: 'urn:madoc:project:8', entity: '', reviews: true });
  const { options, api } = createOptions();
  options.config = next;
  await manifestCsvContributionsExport.exportData({ type: 'manifest', id: 2 }, options);
  expect(api.getProjectFieldsRaw).toHaveBeenCalledWith(8, { status: 'all', manifest_id: 2 });
  expect(resetManifestCsvProjectConfiguration(previous, { ...previous, project_id: undefined }).entity).toBe('');
  expect(
    resetManifestCsvProjectConfiguration(previous, { ...previous, project_id: 'urn:madoc:project:7' }).entity
  ).toBe('old-entity');
  expect(previous.entity).toBe('old-entity');
});
