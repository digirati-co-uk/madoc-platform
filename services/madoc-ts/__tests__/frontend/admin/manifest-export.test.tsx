/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ManifestExport } from '../../../src/frontend/admin/pages/content/manifests/manifest-export';
import { EditShorthandCaptureModel } from '../../../src/frontend/shared/capture-models/EditorShorthandCaptureModel';
import { RichSelectionGrid } from '../../../src/frontend/shared/components/RichSelectionGrid';
import { useExportResourcePreview } from '../../../src/frontend/shared/hooks/use-export-resource-preview';
import { manifestCsvContributionsExport } from '../../../src/extensions/project-export/export-configs/manifest/manifest-csv-contributions-export';

jest.mock('react-router-dom', () => ({ useParams: () => ({ id: '37702' }) }));
jest.mock('../../../src/frontend/shared/capture-models/EditorShorthandCaptureModel', () => ({
  EditShorthandCaptureModel: jest.fn(() => null),
}));
jest.mock('../../../src/frontend/shared/capture-models/new/components/EditorSlots', () => ({
  EditorSlots: { TopLevelEditor: () => null },
}));
jest.mock('../../../src/frontend/shared/components/FilePreview', () => ({ FilePreview: () => null }));
jest.mock('../../../src/frontend/shared/components/RichSelectionGrid', () => ({
  RichSelectionGrid: jest.fn(() => null),
}));
jest.mock('../../../src/frontend/shared/hooks/use-api', () => ({ useApi: () => ({}) }));
jest.mock('../../../src/frontend/shared/hooks/use-data', () => ({
  usePaginatedData: () => ({ resolvedData: undefined }),
  useData: () => ({ data: undefined }),
}));
jest.mock('../../../src/frontend/shared/hooks/use-export-resources', () => ({ useExportResources: () => [[], null] }));
jest.mock('../../../src/frontend/shared/hooks/use-project-exports', () => ({
  useProjectExports: (type: string) =>
    type === 'manifest'
      ? [
          require('../../../src/extensions/project-export/export-configs/manifest/manifest-csv-contributions-export')
            .manifestCsvContributionsExport,
        ]
      : [],
}));
jest.mock('../../../src/frontend/shared/hooks/use-export-resource-preview', () => ({
  useExportResourcePreview: jest.fn(),
}));
jest.mock('../../../src/frontend/admin/molecules/Pagination', () => ({ Pagination: () => null }));
jest.mock('../../../src/frontend/admin/pages/content/manifests/manifest-canvases', () => ({
  ManifestCanvases: () => null,
}));
jest.mock('../../../src/frontend/admin/pages/content/manifests/manifest-projects', () => ({
  ManifestProjects: () => null,
}));

test('manifest admin clears entity on project switch before previewing the new project', () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest
    .mocked(useExportResourcePreview)
    .mockImplementation(selected => [
      { data: undefined } as ReturnType<typeof useExportResourcePreview>[0],
      selected === manifestCsvContributionsExport.type ? manifestCsvContributionsExport : null,
      [],
    ]);
  const root = createRoot(document.createElement('div'));
  const latestEditor = () => jest.mocked(EditShorthandCaptureModel).mock.calls.slice(-1)[0][0];
  try {
    act(() => root.render(<ManifestExport />));
    act(() => jest.mocked(RichSelectionGrid).mock.calls.slice(-1)[0][0].onSelect(manifestCsvContributionsExport.type));
    act(() => latestEditor().onSave?.({ project_id: { uri: 'urn:madoc:project:1' }, entity: '', reviews: true }));
    act(() =>
      latestEditor().onSave?.({ project_id: { uri: 'urn:madoc:project:1' }, entity: 'old-model-entity', reviews: true })
    );
    expect(latestEditor().data.entity).toBe('old-model-entity');
    act(() =>
      latestEditor().onSave?.({ project_id: { uri: 'urn:madoc:project:2' }, entity: 'old-model-entity', reviews: true })
    );
    expect(latestEditor().data).toEqual({ project_id: { uri: 'urn:madoc:project:2' }, entity: '', reviews: true });
    expect(latestEditor().template.entity.dataSource).toBe('madoc-api://projects/2/model-autocomplete');
    expect(jest.mocked(useExportResourcePreview).mock.calls.slice(-1)[0][1].config).toMatchObject({
      entity: '',
      project_id: { uri: 'urn:madoc:project:2' },
    });
  } finally {
    act(() => root.unmount());
    Reflect.deleteProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT');
  }
});
