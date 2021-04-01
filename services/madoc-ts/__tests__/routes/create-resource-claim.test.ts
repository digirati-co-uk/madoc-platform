import { CaptureModel } from '@capture-models/types';
import { ProjectFull } from '../../src/types/schemas/project-full';
import { ApiMock } from '../../test-utility/api-mock';
import { DatabaseMock } from '../../test-utility/database-mock';

beforeEach(() => jest.resetModules());

afterEach(() => {
  jest.clearAllMocks();
});

describe('Create resource claim', () => {
  // Common fixtures
  const mockProject = {
    id: 1,
    slug: '1',
    config: {} as any,
    collection_id: 1,
    capture_model_id: 'model-id',
    status: 1,
    label: { en: ['A test project'] },
    content: {
      canvases: 0,
      manifests: 0,
    },
    statistics: {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0,
    },
    summary: { en: [''] },
    task_id: 'tast-id',
  } as ProjectFull;

  test('default settings - minimum test', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = {
      state: {
        jwt: {
          user: { id: 1, name: 'test' },
          site: { id: 1 },
          scope: ['site.admin'],
        },
      },
      params: {
        id: 1,
      },
      requestBody: {
        canvasId: 123,
      },
      response: {
        status: 0,
        body: {},
      },
      omeka: {
        getUserById(userId: number, siteId: number) {
          return {
            id: userId,
            name: 'Test user',
          };
        },
      },
    };

    db.attachMock(ctx);

    // Needs to be imported this way so we can set up the mocks.
    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // The project is requested to get the collection and model ids.
    apiMock.mockRoute('GET', '/api/madoc/projects/1', mockProject);

    // Different configuration can change this process, here using defaults.
    apiMock.mockRoute(
      'GET',
      '/api/configurator/query?context=urn%3Amadoc%3Aproject%3A1&context=urn%3Amadoc%3Asite%3A1&service=madoc',
      {} as ProjectFull['config']
    );

    db.mockQuery(
      `select task_id, collection_id from iiif_project where site_id = $1 and id = $2`,
      {
        task_id: 'task-id',
        collection_id: 123,
      },
      params => {
        expect(params).toMatchInlineSnapshot(`
          Array [
            1,
            1,
          ]
        `);
      }
    );

    apiMock.mockRoute('GET', '/api/tasks/task-id?all=true&assignee=true&detail=true', {
      id: 1,
      subtasks: [],
    });

    apiMock.mockRoute('GET', '/api/madoc/iiif/canvases/123/manifests?project_id=1', {
      manifests: [2001],
    });

    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/2001/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(
      `
        select item_id from iiif_derived_resource_items 
            left join iiif_resource ir on iiif_derived_resource_items.resource_id = ir.id
        where site_id = $1
        and resource_id = $2
        and ir.type = 'manifest'
        and item_id = $3
      `,
      {
        rowCount: 1,
      },
      params => {
        expect(params).toMatchInlineSnapshot(`
          Array [
            1,
            2001,
            123,
          ]
        `);
      }
    );

    db.mockQuery(
      `
        select * from iiif_derived_resource_items
            left join iiif_resource ir on iiif_derived_resource_items.item_id = ir.id
            left join iiif_project ip on iiif_derived_resource_items.resource_id = ip.collection_id
            where item_id = $1
            and ip.id = $2
            and ir.type = 'manifest'
      `,
      {
        rowCount: 1,
      },
      params => {
        expect(params).toMatchInlineSnapshot(`
          Array [
            2001,
            1,
          ]
        `);
      }
    );

    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/2001', {
      manifest: {
        id: 2001,
        label: { en: ['Test manifest 1'] },
      },
    });

    // Creating the manifest task.
    apiMock.mockRoute(
      'POST',
      '/api/tasks/1/subtasks',
      {
        id: '1',
      },
      body => {
        expect(body).toMatchInlineSnapshot(`
                  Object {
                    "context": Array [
                      "urn:madoc:project:1",
                    ],
                    "events": Array [
                      "madoc-ts.status.3",
                    ],
                    "name": "Test manifest 1",
                    "parameters": Array [],
                    "state": Object {
                      "approvalsRequired": 1,
                    },
                    "status": 1,
                    "status_text": "accepted",
                    "subject": "urn:madoc:manifest:2001",
                    "type": "crowdsourcing-manifest-task",
                  }
              `);
      }
    );

    apiMock.mockRoute('GET', '/api/madoc/iiif/canvases/123', {
      canvas: {
        id: 123,
        label: { en: ['Canvas label'] },
      },
    });

    // Creating the canvas task.
    apiMock.mockRoute(
      'POST',
      '/api/tasks/1/subtasks',
      {
        id: '1',
      },
      body => {
        expect(body).toMatchInlineSnapshot(`
                  Object {
                    "context": Array [
                      "urn:madoc:project:1",
                    ],
                    "events": Array [
                      "madoc-ts.status.3",
                    ],
                    "name": "undefined - Canvas label",
                    "parameters": Array [],
                    "state": Object {
                      "approvalsRequired": 1,
                    },
                    "status": 1,
                    "status_text": "accepted",
                    "subject": "urn:madoc:canvas:123",
                    "type": "crowdsourcing-canvas-task",
                  }
              `);
      }
    );

    db.mockQuery(
      `select task_id, capture_model_id from iiif_project where site_id = $1 and id = $2`,
      {
        task_id: 'task-id-1',
        capture_model_id: 'model_id_1',
      },
      params => {
        expect(params).toMatchInlineSnapshot(`
          Array [
            1,
            1,
          ]
        `);
      }
    );

    apiMock.mockRoute(
      'GET',
      '/api/crowdsourcing/model?derived_from=model_id_1&target_id=urn%3Amadoc%3Acanvas%3A123&target_type=Canvas',
      {
        id: 'some-model',
      }
    );

    apiMock.mockRoute(
      'POST',
      '/api/crowdsourcing/model/model_id_1/clone',
      {
        id: 'forked-model-id',
        document: {
          properties: {},
        },
      } as CaptureModel,
      body => {
        expect(body).toMatchInlineSnapshot(`
          Object {
            "target": Array [
              Object {
                "id": "urn:madoc:manifest:2001",
                "type": "Manifest",
              },
              Object {
                "id": "urn:madoc:canvas:123",
                "type": "Canvas",
              },
            ],
          }
        `);
      }
    );

    apiMock.mockRoute('POST', '/api/tasks/1/subtasks', { id: '1' }, body => {
      expect(body).toMatchInlineSnapshot(`
        Object {
          "assignee": Object {
            "id": "urn:madoc:user:1",
            "name": "Test user",
          },
          "context": Array [
            "urn:madoc:project:1",
          ],
          "events": Array [
            "madoc-ts.status.-1",
            "madoc-ts.status.2",
            "madoc-ts.status.3",
          ],
          "name": "Test user: submission undefined",
          "parameters": Array [
            "forked-model-id",
            null,
            "canvas",
          ],
          "state": Object {},
          "status": 0,
          "status_text": "assigned",
          "subject": "urn:madoc:canvas:123",
          "subject_parent": "urn:madoc:manifest:2001",
          "type": "crowdsourcing-task",
        }
      `);
    });

    await createResourceClaim(ctx);

    expect(ctx.response.body).toEqual({
      claim: {
        id: '1',
      },
    });
  });

  test('Normal user cannot assign to another user', async () => {
    const db = new DatabaseMock();

    const ctx = {
      state: {
        jwt: {
          user: { id: 1, name: 'test' },
          site: { id: 1 },
          scope: ['models.contribute'],
        },
      },
      params: {
        id: 1,
      },
      requestBody: {
        canvasId: 123,
        userId: 456,
      },
      response: {
        status: 0,
        body: {},
      },
    };

    db.attachMock(ctx);

    // Needs to be imported this way so we can set up the mocks.
    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    await expect(() => createResourceClaim(ctx)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Cannot create user on behalf of another"`
    );
  });

  test('should return existing resource claim on behalf of another user', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = {
      state: {
        jwt: {
          user: { id: 1, name: 'test' },
          site: { id: 1 },
          scope: ['site.admin'],
        },
      },
      params: {
        id: 1,
      },
      requestBody: {
        canvasId: 123,
        userId: 456,
      },
      response: {
        status: 0,
        body: {},
      },
    };

    db.attachMock(ctx);

    // Needs to be imported this way so we can set up the mocks.
    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // The project is requested to get the collection and model ids.
    apiMock.mockRoute('GET', '/api/madoc/projects/1', mockProject);

    // Different configuration can change this process, here using defaults.
    apiMock.mockRoute(
      'GET',
      '/api/configurator/query?context=urn%3Amadoc%3Aproject%3A1&context=urn%3Amadoc%3Asite%3A1&service=madoc',
      {} as ProjectFull['config']
    );

    db.mockQuery(
      `select task_id, collection_id from iiif_project where site_id = $1 and id = $2`,
      {
        task_id: 'task-id',
        collection_id: 123,
      },
      params => {
        expect(params).toMatchInlineSnapshot(`
          Array [
            1,
            1,
          ]
        `);
      }
    );

    apiMock.mockRoute('GET', '/api/tasks/task-id?all=true&assignee=true&detail=true', {
      id: 1,
      subtasks: [
        {
          id: 'manifest-task-mock-id',
          context: ['urn:madoc:project:1'],
          events: ['madoc-ts.status.3'],
          name: 'Test manifest 1',
          parameters: [],
          state: {
            approvalsRequired: 1,
          },
          status: 1,
          status_text: 'accepted',
          subject: 'urn:madoc:manifest:2001',
          type: 'crowdsourcing-manifest-task',
        },
      ],
    });

    apiMock.mockRoute('GET', '/api/tasks/manifest-task-mock-id?all=true&assignee=true&detail=true', {
      id: 'manifest-task-mock-id',
      subtasks: [
        {
          id: 'canvas-task-mock-id',
          context: ['urn:madoc:project:1'],
          events: ['madoc-ts.status.3'],
          name: 'undefined - Canvas label',
          parameters: [],
          state: {
            approvalsRequired: 1,
          },
          status: 1,
          status_text: 'accepted',
          subject: 'urn:madoc:canvas:123',
          type: 'crowdsourcing-canvas-task',
        },
      ],
    });

    apiMock.mockRoute('GET', '/api/tasks/canvas-task-mock-id?all=true&assignee=true&detail=true', {
      id: 'canvas-task-mock-id',
      context: ['urn:madoc:project:1'],
      events: ['madoc-ts.status.3'],
      name: 'undefined - Canvas label',
      parameters: [],
      state: {
        approvalsRequired: 1,
      },
      status: 1,
      status_text: 'accepted',
      subject: 'urn:madoc:canvas:123',
      type: 'crowdsourcing-canvas-task',
      subtasks: [
        {
          id: 'delegated-user-task-id',
          assignee: {
            id: 'urn:madoc:user:456',
            name: 'test',
          },
          context: ['urn:madoc:project:1'],
          events: ['madoc-ts.status.-1', 'madoc-ts.status.2', 'madoc-ts.status.3'],
          name: 'User contributions to "undefined"',
          parameters: ['forked-model-id', null, 'canvas'],
          state: {},
          status: 0,
          status_text: 'not started',
          subject: 'urn:madoc:canvas:123',
          subject_parent: 'urn:madoc:manifest:2001',
          type: 'crowdsourcing-task',
        },
      ],
    });

    apiMock.mockRoute('GET', '/api/tasks/delegated-user-task-id?all=true&assignee=true', {
      id: 'delegated-user-task-id',
      assignee: {
        id: 'urn:madoc:user:456',
        name: 'test',
      },
      context: ['urn:madoc:project:1'],
      events: ['madoc-ts.status.-1', 'madoc-ts.status.2', 'madoc-ts.status.3'],
      name: 'User contributions to "undefined"',
      parameters: ['forked-model-id', null, 'canvas'],
      state: {},
      status: 0,
      status_text: 'not started',
      subject: 'urn:madoc:canvas:123',
      subject_parent: 'urn:madoc:manifest:2001',
      type: 'crowdsourcing-task',
    });

    apiMock.mockRoute('GET', '/api/madoc/iiif/canvases/123/manifests?project_id=1', {
      manifests: [2001],
    });

    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/2001/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(
      `
        select item_id from iiif_derived_resource_items 
            left join iiif_resource ir on iiif_derived_resource_items.resource_id = ir.id
        where site_id = $1
        and resource_id = $2
        and ir.type = 'manifest'
        and item_id = $3
      `,
      {
        rowCount: 1,
      },
      params => {
        expect(params).toMatchInlineSnapshot(`
          Array [
            1,
            2001,
            123,
          ]
        `);
      }
    );

    db.mockQuery(
      `
        select * from iiif_derived_resource_items
            left join iiif_resource ir on iiif_derived_resource_items.item_id = ir.id
            left join iiif_project ip on iiif_derived_resource_items.resource_id = ip.collection_id
            where item_id = $1
            and ip.id = $2
            and ir.type = 'manifest'
      `,
      {
        rowCount: 1,
      },
      params => {
        expect(params).toMatchInlineSnapshot(`
          Array [
            2001,
            1,
          ]
        `);
      }
    );

    await createResourceClaim(ctx);

    expect(ctx.response.body).toEqual({
      claim: {
        id: 'delegated-user-task-id',
        assignee: {
          id: 'urn:madoc:user:456',
          name: 'test',
        },
        context: ['urn:madoc:project:1'],
        events: ['madoc-ts.status.-1', 'madoc-ts.status.2', 'madoc-ts.status.3'],
        name: 'User contributions to "undefined"',
        parameters: ['forked-model-id', null, 'canvas'],
        state: {},
        status: 0,
        status_text: 'not started',
        subject: 'urn:madoc:canvas:123',
        subject_parent: 'urn:madoc:manifest:2001',
        type: 'crowdsourcing-task',
      },
    });
  });

  test('creating resource claim on behalf of another user', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = {
      state: {
        jwt: {
          user: { id: 1, name: 'test' },
          site: { id: 1 },
          scope: ['site.admin'],
        },
      },
      params: {
        id: 1,
      },
      requestBody: {
        canvasId: 123,
        userId: 456,
        status: 0,
      },
      response: {
        status: 0,
        body: {},
      },
      omeka: {
        getUserById(userId: number, siteId: number) {
          return {
            id: userId,
            name: 'Test user',
          };
        },
      },
    };

    db.attachMock(ctx);

    // Needs to be imported this way so we can set up the mocks.
    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // The project is requested to get the collection and model ids.
    apiMock.mockRoute('GET', '/api/madoc/projects/1', mockProject);

    // Different configuration can change this process, here using defaults.
    apiMock.mockRoute(
      'GET',
      '/api/configurator/query?context=urn%3Amadoc%3Aproject%3A1&context=urn%3Amadoc%3Asite%3A1&service=madoc',
      {} as ProjectFull['config']
    );

    db.mockQuery(
      `select task_id, collection_id from iiif_project where site_id = $1 and id = $2`,
      {
        task_id: 'task-id',
        collection_id: 123,
      },
      params => {
        expect(params).toMatchInlineSnapshot(`
          Array [
            1,
            1,
          ]
        `);
      }
    );

    apiMock.mockRoute('GET', '/api/tasks/task-id?all=true&assignee=true&detail=true', {
      id: 1,
      subtasks: [],
    });

    apiMock.mockRoute('GET', '/api/madoc/iiif/canvases/123/manifests?project_id=1', {
      manifests: [2001],
    });

    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/2001/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(
      `
        select item_id from iiif_derived_resource_items 
            left join iiif_resource ir on iiif_derived_resource_items.resource_id = ir.id
        where site_id = $1
        and resource_id = $2
        and ir.type = 'manifest'
        and item_id = $3
      `,
      {
        rowCount: 1,
      },
      params => {
        expect(params).toMatchInlineSnapshot(`
          Array [
            1,
            2001,
            123,
          ]
        `);
      }
    );

    db.mockQuery(
      `
        select * from iiif_derived_resource_items
            left join iiif_resource ir on iiif_derived_resource_items.item_id = ir.id
            left join iiif_project ip on iiif_derived_resource_items.resource_id = ip.collection_id
            where item_id = $1
            and ip.id = $2
            and ir.type = 'manifest'
      `,
      {
        rowCount: 1,
      },
      params => {
        expect(params).toMatchInlineSnapshot(`
          Array [
            2001,
            1,
          ]
        `);
      }
    );

    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/2001', {
      manifest: {
        id: 2001,
        label: { en: ['Test manifest 1'] },
      },
    });

    // Creating the manifest task.
    apiMock.mockRoute(
      'POST',
      '/api/tasks/1/subtasks',
      {
        id: '1',
      },
      body => {
        expect(body).toMatchInlineSnapshot(`
                  Object {
                    "context": Array [
                      "urn:madoc:project:1",
                    ],
                    "events": Array [
                      "madoc-ts.status.3",
                    ],
                    "name": "Test manifest 1",
                    "parameters": Array [],
                    "state": Object {
                      "approvalsRequired": 1,
                    },
                    "status": 1,
                    "status_text": "accepted",
                    "subject": "urn:madoc:manifest:2001",
                    "type": "crowdsourcing-manifest-task",
                  }
              `);
      }
    );

    apiMock.mockRoute('GET', '/api/madoc/iiif/canvases/123', {
      canvas: {
        id: 123,
        label: { en: ['Canvas label'] },
      },
    });

    // Creating the canvas task.
    apiMock.mockRoute(
      'POST',
      '/api/tasks/1/subtasks',
      {
        id: '1',
      },
      body => {
        expect(body).toMatchInlineSnapshot(`
                  Object {
                    "context": Array [
                      "urn:madoc:project:1",
                    ],
                    "events": Array [
                      "madoc-ts.status.3",
                    ],
                    "name": "undefined - Canvas label",
                    "parameters": Array [],
                    "state": Object {
                      "approvalsRequired": 1,
                    },
                    "status": 1,
                    "status_text": "accepted",
                    "subject": "urn:madoc:canvas:123",
                    "type": "crowdsourcing-canvas-task",
                  }
              `);
      }
    );

    db.mockQuery(
      `select task_id, capture_model_id from iiif_project where site_id = $1 and id = $2`,
      {
        task_id: 'task-id-1',
        capture_model_id: 'model_id_1',
      },
      params => {
        expect(params).toMatchInlineSnapshot(`
          Array [
            1,
            1,
          ]
        `);
      }
    );

    apiMock.mockRoute(
      'GET',
      '/api/crowdsourcing/model?derived_from=model_id_1&target_id=urn%3Amadoc%3Acanvas%3A123&target_type=Canvas',
      {
        id: 'some-model',
      }
    );

    apiMock.mockRoute(
      'POST',
      '/api/crowdsourcing/model/model_id_1/clone',
      {
        id: 'forked-model-id',
        document: {
          properties: {},
        },
      } as CaptureModel,
      body => {
        expect(body).toMatchInlineSnapshot(`
          Object {
            "target": Array [
              Object {
                "id": "urn:madoc:manifest:2001",
                "type": "Manifest",
              },
              Object {
                "id": "urn:madoc:canvas:123",
                "type": "Canvas",
              },
            ],
          }
        `);
      }
    );

    apiMock.mockRoute('POST', '/api/tasks/1/subtasks', { id: '1', status: 0 }, body => {
      expect(body).toMatchInlineSnapshot(`
        Object {
          "assignee": Object {
            "id": "urn:madoc:user:456",
            "name": "Test user",
          },
          "context": Array [
            "urn:madoc:project:1",
          ],
          "events": Array [
            "madoc-ts.status.-1",
            "madoc-ts.status.2",
            "madoc-ts.status.3",
          ],
          "name": "Test user: submission undefined",
          "parameters": Array [
            "forked-model-id",
            null,
            "canvas",
          ],
          "state": Object {},
          "status": 0,
          "status_text": "assigned",
          "subject": "urn:madoc:canvas:123",
          "subject_parent": "urn:madoc:manifest:2001",
          "type": "crowdsourcing-task",
        }
      `);
    });

    await createResourceClaim(ctx);

    expect(ctx.response.body).toEqual({
      claim: {
        id: '1',
        status: 0,
      },
    });
  });
});
