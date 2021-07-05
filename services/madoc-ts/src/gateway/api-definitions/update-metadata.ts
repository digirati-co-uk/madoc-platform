import { JSONSchema7 } from 'json-schema';
import { MetadataUpdate } from '../../types/schemas/metadata-update';
import { ApiDefinition, ApiRequest } from './_meta';

export type UpdateCanvasMetadataRequest = ApiRequest<
  'update-canvas-metadata',
  {
    body: MetadataUpdate;
    params: {
      canvas_id: number;
    };
  }
>;

export type UpdateManifestMetadataRequest = ApiRequest<
  'update-manifest-metadata',
  {
    body: MetadataUpdate;
    params: {
      manifest_id: number;
    };
  }
>;

export type UpdateCollectionMetadataRequest = ApiRequest<
  'update-collection-metadata',
  {
    body: MetadataUpdate;
    params: {
      collection_id: number;
    };
  }
>;

const $metadataUpdateSchema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    added: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
          },
          language: {
            type: 'string',
          },
          value: {
            type: 'string',
          },
          key: {
            type: 'string',
          },
          source: {
            type: 'string',
          },
          edited: {
            type: 'boolean',
          },
          auto_update: {
            type: 'boolean',
          },
          readonly: {
            type: 'boolean',
          },
          data: {},
        },
        required: ['key', 'language', 'value'],
      },
    },
    removed: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    modified: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
          },
          language: {
            type: 'string',
          },
          value: {
            type: 'string',
          },
          key: {
            type: 'string',
          },
          source: {
            type: 'string',
          },
          edited: {
            type: 'boolean',
          },
          auto_update: {
            type: 'boolean',
          },
          readonly: {
            type: 'boolean',
          },
          data: {},
        },
        required: ['key', 'language', 'value'],
      },
    },
  },
};

export const updateCanvasMetadata: ApiDefinition = {
  id: 'update-canvas-metadata',
  name: 'Updates metadata for canvas',
  description: [`Additions, removals and modifications to IIIF metadata values for a canvas.`],
  url: '/api/madoc/iiif/canvases/:canvas_id/metadata',
  method: 'PUT',
  params: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      canvas_id: { type: 'number' },
    },
    required: ['canvas_id'],
  },
  scope: ['site.admin'],
  subjects: [
    {
      type: 'canvas',
      label: 'Target canvas',
      source: 'params',
      path: ['canvas_id'],
    },
  ],
  query: null,
  body: $metadataUpdateSchema,
};

export const updateManifestMetadata: ApiDefinition = {
  id: 'update-manifest-metadata',
  name: 'Updates metadata for manifest',
  description: [`Additions, removals and modifications to IIIF metadata values for a manifest.`],
  url: '/api/madoc/iiif/manifests/:manifest_id/metadata',
  method: 'PUT',
  params: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      manifest_id: { type: 'number' },
    },
    required: ['manifest_id'],
  },
  scope: ['site.admin'],
  subjects: [
    {
      type: 'manifest',
      label: 'Target manifest',
      source: 'params',
      path: ['manifest_id'],
    },
  ],
  query: null,
  body: $metadataUpdateSchema,
};

export const updateCollectionMetadata: ApiDefinition = {
  id: 'update-collection-metadata',
  name: 'Updates metadata for collection',
  description: [`Additions, removals and modifications to IIIF metadata values for a collection.`],
  url: '/api/madoc/iiif/collections/:collection_id/metadata',
  method: 'PUT',
  params: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      collection_id: { type: 'number' },
    },
    required: ['collection_id'],
  },
  scope: ['site.admin'],
  subjects: [
    {
      type: 'collection',
      label: 'Target collection',
      source: 'params',
      path: ['collection_id'],
    },
  ],
  query: null,
  body: $metadataUpdateSchema,
};
