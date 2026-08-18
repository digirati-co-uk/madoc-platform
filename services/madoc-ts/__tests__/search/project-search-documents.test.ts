import { buildProjectSearchDocuments } from '../../src/search/typesense/build-project-search-documents';
import type { ProjectSearchCaptureModelRow } from '../../src/database/queries/search-index-export';
import type { ProjectSearchIndexDefinition } from '../../src/types/schemas/project-search-index';

const definition: ProjectSearchIndexDefinition = {
  id: 'people-index',
  label: 'People',
  entityPath: ['people'],
  uniqueField: ['authority'],
  facets: [{ path: ['role'], label: 'Role' }],
  includeUnapproved: false,
  enabled: true,
};

function model(id: string, canvasId: number, name: string, draftValue: string): ProjectSearchCaptureModelRow {
  return {
    model_id: id,
    target: [{ id: `urn:madoc:canvas:${canvasId}`, type: 'Canvas' }],
    revisions: [{ id: 'draft-revision', status: 'draft', approved: false }],
    document_data: {
      id: `document-${id}`,
      type: 'entity',
      label: 'Page',
      properties: {
        people: [
          {
            id: `person-${id}`,
            type: 'entity',
            label: 'Person',
            pluralLabel: 'People',
            labelledBy: 'name',
            selector: { id: `selector-${id}`, type: 'box-selector', state: { x: 10, y: 20, width: 30, height: 40 } },
            properties: {
              name: [{ id: `name-${id}`, type: 'text-field', label: 'Name', value: name }],
              authority: [{ id: `authority-${id}`, type: 'text-field', label: 'Authority', value: 'person:1' }],
              role: [{ id: `role-${id}`, type: 'text-field', label: 'Role', value: 'Author' }],
              draft: [
                {
                  id: `draft-${id}`,
                  type: 'text-field',
                  label: 'Draft',
                  value: draftValue,
                  revision: 'draft-revision',
                },
              ],
            },
          },
        ],
      },
    },
  };
}

describe('project search documents', () => {
  test('indexes nested entities, groups unique values, filters drafts and keeps IIIF context', async () => {
    const result = await buildProjectSearchDocuments({
      definition,
      projectId: 9,
      models: [model('one', 101, 'Ada', 'private one'), model('two', 102, 'Ada Lovelace', 'private two')],
      iiifResources: [
        {
          resource_id: 101,
          resource_type: 'canvas',
          manifest_id: 201,
          default_thumbnail: 'https://example.org/101.jpg',
          items_json: [
            {
              items: [
                {
                  body: {
                    service: [{ id: 'https://example.org/iiif/101', type: 'ImageService3' }],
                  },
                },
              ],
            },
          ],
          width: 1000,
          height: 1000,
        },
        {
          resource_id: 102,
          resource_type: 'canvas',
          manifest_id: 202,
          default_thumbnail: 'https://example.org/102.jpg',
          items_json: null,
          width: 1000,
          height: 1000,
        },
      ],
    });

    expect(result.documents).toHaveLength(1);
    expect(result.documents[0]).toMatchObject({
      resource_label: 'Ada',
      canvas_ids: ['101', '102'],
      manifest_ids: ['201', '202'],
      facet_role: ['Author'],
      region: '10,20,30,40',
    });
    expect(result.documents[0].thumbnail).toContain('https://example.org/iiif/101/10,20,30,40/256,/');
    expect(result.documents[0].search_text).not.toContain('private one');
  });

  test('can index the whole model and include non-approved values', async () => {
    const result = await buildProjectSearchDocuments({
      definition: {
        ...definition,
        entityPath: [],
        uniqueField: undefined,
        facets: [],
        includeUnapproved: true,
      },
      projectId: 9,
      models: [model('one', 101, 'Ada', 'private one')],
      iiifResources: [
        {
          resource_id: 101,
          resource_type: 'canvas',
          manifest_id: 201,
          default_thumbnail: null,
          items_json: null,
          width: 1000,
          height: 1000,
        },
      ],
    });

    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].search_text).toContain('private one');
  });
});
