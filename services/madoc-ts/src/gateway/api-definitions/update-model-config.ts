import { ConfigInjectionSettings } from '../../extensions/capture-models/ConfigInjection/types';
import { ApiDefinition, ApiRequest } from './_meta';

export type UpdateModelConfigRequest = ApiRequest<
  'update-model-config',
  {
    body: ConfigInjectionSettings;
    query: {
      manifestId: number;
      projectId: number | string;
      collectionId?: number;
    };
  }
>;

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
  query: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      collectionId: { type: 'number' },
      manifestId: { type: 'number' },
      projectId: { anyOf: [{ type: 'number' }, { type: 'string' }] },
    },
    required: ['manifestId', 'projectId'],
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
