import { ManifestSearchExportRow, SearchExportCaptureModelRow } from '../../src/database/queries/search-index-export';
import {
  buildManifestTypesenseDocument,
  buildProjectTypesenseDocument,
  streamManifestTypesenseDocuments,
} from '../../src/search/typesense/build-manifest-documents';
import { flattenCaptureModelFieldsByResource } from '../../src/search/typesense/flatten-capture-model-fields';
import { getTypesenseProjectFilter } from '../../src/search/typesense/project-filter';

describe('getTypesenseProjectFilter', () => {
  test('scopes searches to the indexed project context', () => {
    expect(getTypesenseProjectFilter(99)).toEqual('contexts:=`urn:madoc:project:99`');
    expect(getTypesenseProjectFilter()).toBeUndefined();
  });
});

describe('flattenCaptureModelFieldsByResource', () => {
  test('flattens capture model fields per target resource', () => {
    const rows: SearchExportCaptureModelRow[] = [
      {
        model_id: 'urn:madoc:model:ocr-correction',
        target_id: 'urn:madoc:canvas:10',
        document_data: {
          id: 'doc-1',
          type: 'entity',
          label: 'Root',
          properties: {
            transcription: [
              {
                id: 'field-1',
                type: 'text-field',
                label: 'Transcription',
                value: 'The quick brown fox',
              },
            ],
          },
        },
      },
    ];

    const flattened = flattenCaptureModelFieldsByResource(rows);

    expect(flattened['urn:madoc:canvas:10']).toBeDefined();
    expect(flattened['urn:madoc:canvas:10'].fields.capture_model_ocr_correction).toContain('The quick brown fox');
    expect(flattened['urn:madoc:canvas:10'].searchText).toContain('The quick brown fox');
    expect(flattened['urn:madoc:canvas:10'].labels).toEqual(expect.arrayContaining(['Root', 'Transcription']));
    expect(flattened['urn:madoc:canvas:10'].fields.capture_model_ocr_correction).not.toContain('Transcription');
  });

  test('falls back to raw value extraction for non-capture-model documents', () => {
    const rows: SearchExportCaptureModelRow[] = [
      {
        model_id: 'urn:madoc:model:fallback',
        target_id: 'urn:madoc:manifest:22',
        document_data: {
          arbitrary: 'value-a',
          nested: {
            enabled: true,
            count: 2,
          },
        },
      },
    ];

    const flattened = flattenCaptureModelFieldsByResource(rows);

    expect(flattened['urn:madoc:manifest:22'].fields.capture_model_fallback).toEqual(
      expect.arrayContaining(['value-a', 'true', '2'])
    );
  });
});

describe('buildManifestTypesenseDocument', () => {
  test('maps contexts, metadata facets, and capture model values', () => {
    const row: ManifestSearchExportRow = {
      resource_id: 10,
      resource_type: 'Canvas',
      item_index: 2,
      source: null,
      rights: 'cc-by',
      nav_date: null,
      thumbnail: 'https://example.org/thumb.jpg',
      default_thumbnail: null,
      placeholder_image: null,
      primary_manifest_id: 5,
      manifest_ids: [5, 6],
      project_ids: [99],
      project_facets: ['99|Example project'],
      collection_ids: [44],
      metadata: [
        {
          key: 'label',
          value: 'Canvas label',
          language: 'en',
          source: 'iiif',
          data: null,
        },
        {
          key: 'metadata.0.label',
          value: 'Creator',
          language: 'en',
          source: 'iiif',
          data: null,
        },
        {
          key: 'metadata.0.value',
          value: 'John Doe',
          language: 'en',
          source: 'iiif',
          data: null,
        },
      ],
    };

    const document = buildManifestTypesenseDocument(row, {
      siteId: 1,
      siteUrn: 'urn:madoc:site:1',
      captureModelByResource: {
        'urn:madoc:canvas:10': {
          fields: {
            capture_model_ocr: ['Extracted OCR'],
          },
          searchText: ['Extracted OCR'],
          labels: ['Transcription'],
        },
      },
    });

    expect(document.id).toEqual('urn:madoc:canvas:10:site:1');
    expect(document.manifest_id).toEqual('urn:madoc:manifest:5');
    expect(document.manifest_ids).toEqual(['5', '6']);
    expect(document.project_ids).toEqual(['99']);
    expect(document.project_facets).toEqual(['99|Example project']);
    expect(document.collection_ids).toEqual(['44']);
    expect(document.contexts).toEqual(
      expect.arrayContaining([
        'urn:madoc:site:1',
        'urn:madoc:manifest:5',
        'urn:madoc:manifest:6',
        'urn:madoc:project:99',
        'urn:madoc:collection:44',
        'urn:madoc:canvas:10',
      ])
    );
    expect(document.capture_model_ocr).toEqual(['Extracted OCR']);
    expect(document.search_text).toEqual(expect.arrayContaining(['Canvas label', 'John Doe', 'Extracted OCR']));
    expect(document.search_context).toEqual(['Transcription']);
    expect(document.metadata_creator).toEqual(['John Doe']);
    expect(document.metadata_pairs).toContain('creator:John Doe');
    expect(document.sort_index).toEqual(3);
  });

  test('maps projects using their banner and site-only search context', () => {
    const document = buildProjectTypesenseDocument(
      {
        id: 99,
        collection_id: 44,
        slug: 'example-project',
        capture_model_id: 'model-1',
        task_id: 'task-1',
        label: { en: ['Example project'] },
        summary: { en: ['A useful project summary'] },
        status: 1,
        placeholderImage: 'https://example.org/banner.jpg',
      },
      { siteId: 1, siteUrn: 'urn:madoc:site:1' }
    );

    expect(document.resource_id).toEqual('urn:madoc:project:99');
    expect(document.resource_type).toEqual('Project');
    expect(document.thumbnail).toEqual('https://example.org/banner.jpg');
    expect(document.search_text).toEqual(['A useful project summary']);
    expect(document.contexts).toEqual(['urn:madoc:site:1']);
    expect(document.project_facets).toEqual([]);
  });

  test('streams all rows', () => {
    const rows: ManifestSearchExportRow[] = [
      {
        resource_id: 5,
        resource_type: 'Manifest',
        item_index: null,
        source: null,
        rights: null,
        nav_date: null,
        thumbnail: null,
        default_thumbnail: null,
        placeholder_image: null,
        primary_manifest_id: 5,
        manifest_ids: [5],
        project_ids: [],
        project_facets: [],
        collection_ids: [],
        metadata: [
          {
            key: 'label',
            value: 'Manifest one',
            language: 'en',
            source: 'iiif',
            data: null,
          },
        ],
      },
      {
        resource_id: 6,
        resource_type: 'Canvas',
        item_index: 0,
        source: null,
        rights: null,
        nav_date: null,
        thumbnail: null,
        default_thumbnail: null,
        placeholder_image: null,
        primary_manifest_id: 5,
        manifest_ids: [5],
        project_ids: [],
        project_facets: [],
        collection_ids: [],
        metadata: [
          {
            key: 'label',
            value: 'Canvas one',
            language: 'en',
            source: 'iiif',
            data: null,
          },
        ],
      },
    ];

    const documents = [...streamManifestTypesenseDocuments(rows, { siteId: 4, siteUrn: 'urn:madoc:site:4' })];

    expect(documents).toHaveLength(2);
    expect(documents[0].resource_type).toEqual('Manifest');
    expect(documents[1].resource_type).toEqual('Canvas');
  });

  test('maps collections as searchable resources', () => {
    const row: ManifestSearchExportRow = {
      resource_id: 44,
      resource_type: 'Collection',
      item_index: null,
      source: null,
      rights: null,
      nav_date: null,
      thumbnail: 'https://example.org/collection.jpg',
      default_thumbnail: null,
      placeholder_image: null,
      primary_manifest_id: 5,
      manifest_ids: [5],
      project_ids: [99],
      project_facets: ['99|Example project'],
      collection_ids: [44],
      metadata: [{ key: 'label', value: 'Collection one', language: 'en', source: 'iiif', data: null }],
    };

    const document = buildManifestTypesenseDocument(row, { siteId: 1, siteUrn: 'urn:madoc:site:1' });

    expect(document.id).toEqual('urn:madoc:collection:44:site:1');
    expect(document.resource_type).toEqual('Collection');
    expect(document.resource_label).toEqual('Collection one');
    expect(document.contexts).toEqual(expect.arrayContaining(['urn:madoc:project:99', 'urn:madoc:collection:44']));
  });
});
