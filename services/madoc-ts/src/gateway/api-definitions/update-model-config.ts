import { ApiDefinition } from './_meta';

export const updateModelConfig: ApiDefinition = {
  id: 'update-model-config',
  name: 'Update model configuration for a manifest in a project',
  description: [
    `This will change capture model fields based on which manifest they belong to.
     This will not affect existing capture models and only the field and project
     specified. A common use case for this is to change an autocomplete endpoint
     to be more relevant to the manifest, if it is available.
    `,
  ],
  url: '/api/madoc/configuration/model',
  method: 'POST',
  params: null,
  scope: ['site.admin'],
  subjects: [
    {
      type: 'manifest',
      label: 'Target manifest',
      source: 'query',
      path: ['manifest_id'],
    },
    {
      type: 'project',
      label: 'Project',
      source: 'query',
      path: ['project_id'],
    },
  ],
  query: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      collection_id: { type: 'number' },
      manifest_id: { type: 'number' },
      project_id: { anyOf: [{ type: 'number' }, { type: 'string' }] },
    },
    required: ['manifest_id', 'project_id'],
  },
  body: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      documentChanges: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            property: {
              type: 'string',
            },
            field: {
              type: 'string',
            },
            value: {},
          },
          required: ['field', 'property', 'value'],
        },
      },
    },
    required: ['documentChanges'],
  },
};
