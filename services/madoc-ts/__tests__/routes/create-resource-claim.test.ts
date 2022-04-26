import { CaptureModel } from '../../src/frontend/shared/capture-models/types/capture-model';
import { ProjectFull } from '../../src/types/project-full';
import { ApiMock } from '../../test-utility/api-mock';
import { DatabaseMock } from '../../test-utility/database-mock';
import { createProjectMock, KoaContextMock } from '../../test-utility/mocks';
import { sqlMock } from '../../test-utility/utils';

beforeEach(() => jest.resetModules());

afterEach(() => {
  jest.clearAllMocks();
});

describe('Create resource claim', () => {
  // Common fixtures
  const mockProject = createProjectMock();

  // Queries used in these tests.
  const countManifestsQuery = sqlMock<{ item_id: number }>`
      select item_id from iiif_derived_resource_items 
          left join iiif_resource ir on iiif_derived_resource_items.resource_id = ir.id
      where site_id = $1
      and resource_id = $2
      and ir.type = 'manifest'
      and item_id = $3
  `;

  const countCollectionQuery = sqlMock<{ item_id: number }>`
      select * from iiif_derived_resource_items
                        left join iiif_resource ir on iiif_derived_resource_items.item_id = ir.id
                        left join iiif_project ip on iiif_derived_resource_items.resource_id = ip.collection_id
      where item_id = $1
        and ip.id = $2
        and ir.type = 'manifest'
  `;

  const projectTaskQuery = sqlMock<{ task_id: string; collection_id: number }, [number, number]>`
    select task_id, collection_id from iiif_project where site_id = $1 and id = $2
  `;

  const projectModelQuery = sqlMock<{ task_id: string; capture_model_id: string }>`
    select task_id, capture_model_id, template_name, template_config from iiif_project where site_id = $1 and id = $2
  `;

  test('default settings - minimum test', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();
    const ctx = new KoaContextMock()
      .withRequestBody({
        canvasId: 123,
      })
      .withParams({
        id: 1,
      })
      .withScope(['site.admin'])
      .get();

    db.attachMock(ctx);

    // Needs to be imported this way so we can set up the mocks.
    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // The project is requested to get the collection and model ids.
    apiMock.mockRoute('GET', '/api/madoc/projects/1', mockProject);

    // Different configuration can change this process, here using defaults.
    apiMock.mockConfigRequest(1, {});

    db.mockQuery(
      projectTaskQuery,
      {
        task_id: mockProject.task_id,
        collection_id: mockProject.collection_id,
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
      countManifestsQuery,
      {
        rowCount: 1,
        item_id: 1,
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
      countCollectionQuery,
      {
        item_id: 1,
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
              "madoc-ts.subtask_created",
              "madoc-ts.status.3",
            ],
            "name": "Test manifest 1",
            "parameters": Array [
              false,
            ],
            "state": Object {
              "approvalsRequired": 1,
            },
            "status": 0,
            "status_text": "not started",
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
      projectModelQuery,
      {
        task_id: mockProject.task_id,
        capture_model_id: mockProject.capture_model_id,
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
      '/api/crowdsourcing/model?derived_from=model-id&target_id=urn%3Amadoc%3Acanvas%3A123&target_type=Canvas',
      {
        id: 'some-model',
      }
    );

    apiMock.mockRoute(
      'POST',
      '/api/crowdsourcing/model/model-id/clone',
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
            "name": "test",
          },
          "context": Array [
            "urn:madoc:project:1",
          ],
          "events": Array [
            "madoc-ts.status.-1",
            "madoc-ts.status.2",
            "madoc-ts.status.3",
            "madoc-ts.status.4",
          ],
          "name": "test: submission undefined",
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

    apiMock.assertEmpty();
    db.assertEmpty();
  });

  test('Normal user cannot assign to another user', async () => {
    const db = new DatabaseMock();

    const ctx = new KoaContextMock()
      .withUser({
        id: 1,
        name: 'test',
      })
      .withScope(['models.contribute'])
      .withParams({
        id: 1,
      })
      .withRequestBody({
        canvasId: 123,
        userId: 456,
      })
      .get();

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

    const ctx = new KoaContextMock()
      .withUser({
        id: 1,
        name: 'test',
      })
      .withScope(['site.admin'])
      .withParams({ id: 1 })
      .withRequestBody({ canvasId: 123, userId: 456 })
      .get();

    db.attachMock(ctx);

    // Needs to be imported this way so we can set up the mocks.
    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // The project is requested to get the collection and model ids.
    apiMock.mockRoute('GET', '/api/madoc/projects/1', mockProject);

    // Different configuration can change this process, here using defaults.
    apiMock.mockConfigRequest(1, {});

    db.mockQuery(
      projectTaskQuery,
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
      countManifestsQuery,
      {
        rowCount: 1,
        item_id: 1,
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
      countCollectionQuery,
      {
        item_id: 1,
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

    apiMock.assertEmpty();
    db.assertEmpty();
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
      siteManager: {
        getSiteUserById(userId: number, siteId: number) {
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
    apiMock.mockConfigRequest(1, {});

    db.mockQuery(
      projectTaskQuery,
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
      countManifestsQuery,
      {
        rowCount: 1,
        item_id: 1,
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
      countCollectionQuery,
      {
        item_id: 1,
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
              "madoc-ts.subtask_created",
              "madoc-ts.status.3",
            ],
            "name": "Test manifest 1",
            "parameters": Array [
              false,
            ],
            "state": Object {
              "approvalsRequired": 1,
            },
            "status": 0,
            "status_text": "not started",
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
      projectModelQuery,
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
            "madoc-ts.status.4",
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

    apiMock.assertEmpty();
    db.assertEmpty();
  });

  test('User can claim manifest they already have claimed', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = new KoaContextMock()
      .withUser({ id: 1, name: 'test' })
      .withParams({
        id: 1,
      })
      .withRequestBody({
        manifestId: 456,
      })
      .withScope(['models.contribute'])
      .get();

    db.attachMock(ctx);

    const projectConfiguration: ProjectFull['config'] = {
      claimGranularity: 'manifest',
    };

    const project = createProjectMock(projectConfiguration);

    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // Start of mocks.

    apiMock.mockRoute('GET', '/api/madoc/projects/1', project);
    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/456/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(countCollectionQuery, { item_id: 1, rowCount: 1 });
    apiMock.mockConfigRequest(1, projectConfiguration);
    db.mockQuery(projectTaskQuery, { task_id: 'project-task-id', collection_id: 1 });

    // Limit has been reached, so our project task needs to contain a manifest task.
    apiMock.mockRoute('GET', '/api/tasks/project-task-id?all=true&assignee=true&detail=true', {
      id: 'project-task-id',
      subtasks: [
        {
          id: 'manifest-crowd-task-1',
          type: 'crowdsourcing-manifest-task',
          subject: 'urn:madoc:manifest:456',
        },
      ],
    });
    // In the manifest task, we need a user manifest task assigned to the user.
    apiMock.mockRoute('GET', '/api/tasks/manifest-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'manifest-crowd-task-1',
      subtasks: [
        {
          id: 'manifest-crowd-task-1',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:1',
            name: 'test',
          },
          subject: 'urn:madoc:manifest:456',
        },
      ],
    });

    // No sure why we need to load it? Maybe in case we are checking for a canvas task too.
    apiMock.mockRoute('GET', '/api/tasks/manifest-crowd-task-1?all=true&assignee=true', {
      id: 'manifest-crowd-task-1',
      type: 'crowdsourcing-task',
      status: 1,
      assignee: {
        id: 'urn:madoc:user:1',
        name: 'test',
      },
      subject: 'urn:madoc:manifest:456',
      subtasks: [],
    });

    await createResourceClaim(ctx);

    expect(ctx.response).toMatchInlineSnapshot(`
      Object {
        "body": Object {
          "claim": Object {
            "assignee": Object {
              "id": "urn:madoc:user:1",
              "name": "test",
            },
            "id": "manifest-crowd-task-1",
            "status": 1,
            "subject": "urn:madoc:manifest:456",
            "subtasks": Array [],
            "type": "crowdsourcing-task",
          },
        },
        "status": 0,
      }
    `);

    apiMock.assertEmpty();
    db.assertEmpty();
  });

  test('User cannot claim manifest that has reached capacity.', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = new KoaContextMock()
      .withUser({ id: 1, name: 'test' })
      .withParams({
        id: 1,
      })
      .withRequestBody({
        manifestId: 456,
      })
      .withScope(['models.contribute'])
      .get();

    db.attachMock(ctx);

    const projectConfiguration: ProjectFull['config'] = {
      claimGranularity: 'manifest',
    };

    const project = createProjectMock(projectConfiguration);

    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // Start of mocks.

    apiMock.mockRoute('GET', '/api/madoc/projects/1', project);
    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/456/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(countCollectionQuery, { item_id: 1, rowCount: 1 });
    apiMock.mockConfigRequest(1, projectConfiguration);
    db.mockQuery(projectTaskQuery, { task_id: 'project-task-id', collection_id: 1 });

    // Limit has been reached, so our project task needs to contain a manifest task.
    apiMock.mockRoute('GET', '/api/tasks/project-task-id?all=true&assignee=true&detail=true', {
      id: 'project-task-id',
      subtasks: [
        {
          id: 'manifest-crowd-task-1',
          type: 'crowdsourcing-manifest-task',
          subject: 'urn:madoc:manifest:456',
          state: {
            // Can start adding to this as we need.
            maxContributors: 2,
            approvalsRequired: 1,
          },
        },
      ],
    });
    // In the manifest task, we need a user manifest task assigned to the user.
    apiMock.mockRoute('GET', '/api/tasks/manifest-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'manifest-crowd-task-1',
      type: 'crowdsourcing-manifest-task',
      subject: 'urn:madoc:manifest:456',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        {
          id: 'manifest-crowd-task-2',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:2',
            name: 'test',
          },
          subject: 'urn:madoc:manifest:456',
        },
        {
          id: 'manifest-crowd-task-3',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:3',
            name: 'test',
          },
          subject: 'urn:madoc:manifest:456',
        },
      ],
    });

    await expect(() => createResourceClaim(ctx)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Maximum number of contributors reached"`
    );

    apiMock.assertEmpty();
    db.assertEmpty();
  });

  test('User cannot claim canvas that has reached capacity', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = new KoaContextMock()
      .withUser({ id: 1, name: 'test' })
      .withParams({
        id: 1,
      })
      .withRequestBody({
        manifestId: 456,
        canvasId: 123,
      })
      .withScope(['models.contribute'])
      .get();

    db.attachMock(ctx);

    const projectConfiguration: ProjectFull['config'] = {
      claimGranularity: 'canvas',
    };

    const project = createProjectMock(projectConfiguration);

    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // Start of mocks.

    apiMock.mockRoute('GET', '/api/madoc/projects/1', project);
    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/456/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(countManifestsQuery, { item_id: 1, rowCount: 1 });
    db.mockQuery(countCollectionQuery, { item_id: 1, rowCount: 1 });
    apiMock.mockConfigRequest(1, projectConfiguration);
    db.mockQuery(projectTaskQuery, { task_id: 'project-task-id', collection_id: 1 });

    // Project task, containing manifest task.
    apiMock.mockRoute('GET', '/api/tasks/project-task-id?all=true&assignee=true&detail=true', {
      id: 'project-task-id',
      subtasks: [
        {
          id: 'manifest-crowd-task-1',
          type: 'crowdsourcing-manifest-task',
          subject: 'urn:madoc:manifest:456',
        },
      ],
    });

    // Manifest task, containing canvas task.
    apiMock.mockRoute('GET', '/api/tasks/manifest-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'manifest-crowd-task-1',
      type: 'crowdsourcing-manifest-task',
      subject: 'urn:madoc:manifest:456',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        {
          id: 'canvas-crowd-task-1',
          type: 'crowdsourcing-canvas-task',
          status: 1,
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    // Canvas task, containing 2 submissions from different users.
    apiMock.mockRoute('GET', '/api/tasks/canvas-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'canvas-crowd-task-1',
      type: 'crowdsourcing-canvas-task',
      subject: 'urn:madoc:canvas:123',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        {
          id: 'canvas-user-task-1',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:2',
            name: 'test',
          },
          subject: 'urn:madoc:canvas:123',
        },
        {
          id: 'canvas-user-task-2',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:3',
            name: 'test',
          },
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    // Mocks.
    await expect(() => createResourceClaim(ctx)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Maximum number of contributors reached"`
    );

    apiMock.assertEmpty();
    db.assertEmpty();
  });

  test('User can create canvas claim if they already claim manifest', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = new KoaContextMock()
      .withUser({ id: 1, name: 'test' })
      .withParams({
        id: 1,
      })
      .withRequestBody({
        manifestId: 456,
        canvasId: 123,
      })
      .withScope(['models.contribute'])
      .get();

    db.attachMock(ctx);

    const projectConfiguration: ProjectFull['config'] = {
      claimGranularity: 'manifest',
    };

    const project = createProjectMock(projectConfiguration);

    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // Start of mocks.

    apiMock.mockRoute('GET', '/api/madoc/projects/1', project);
    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/456/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(countManifestsQuery, { item_id: 1, rowCount: 1 });
    db.mockQuery(countCollectionQuery, { item_id: 1, rowCount: 1 });
    apiMock.mockConfigRequest(1, projectConfiguration);
    db.mockQuery(projectTaskQuery, { task_id: 'project-task-id', collection_id: 1 });

    // Limit has been reached, so our project task needs to contain a manifest task.
    apiMock.mockRoute('GET', '/api/tasks/project-task-id?all=true&assignee=true&detail=true', {
      id: 'project-task-id',
      subtasks: [
        {
          id: 'manifest-crowd-task-1',
          type: 'crowdsourcing-manifest-task',
          subject: 'urn:madoc:manifest:456',
          state: {
            // Can start adding to this as we need.
            maxContributors: 2,
            approvalsRequired: 1,
          },
        },
      ],
    });
    // In the manifest task, we need a user manifest task assigned to the user.
    apiMock.mockRoute('GET', '/api/tasks/manifest-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'manifest-crowd-task-1',
      type: 'crowdsourcing-manifest-task',
      subject: 'urn:madoc:manifest:456',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // Manifest claims
        {
          id: 'manifest-crowd-task-2',
          type: 'crowdsourcing-task',
          status: 0,
          assignee: {
            id: 'urn:madoc:user:1',
            name: 'test',
          },
          subject: 'urn:madoc:manifest:456',
        },
        {
          id: 'manifest-crowd-task-3',
          type: 'crowdsourcing-task',
          status: 0,
          assignee: {
            id: 'urn:madoc:user:3',
            name: 'test',
          },
          subject: 'urn:madoc:manifest:456',
        },

        // Canvases
        {
          id: 'canvas-crowd-task-1',
          type: 'crowdsourcing-task',
          status: 1,
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    apiMock.mockRoute('GET', '/api/tasks/manifest-crowd-task-2?all=true&assignee=true&detail=true', {
      id: 'manifest-crowd-task-2',
      type: 'crowdsourcing-task',
      status: 0,
      assignee: {
        id: 'urn:madoc:user:1',
        name: 'test',
      },
      subject: 'urn:madoc:manifest:456',
    });

    apiMock.mockRoute('GET', '/api/tasks/canvas-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'canvas-crowd-task-1',
      type: 'crowdsourcing-canvas-task',
      subject: 'urn:madoc:canvas:123',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // One other task created by another user.
        // We want to verify that a user is allowed to make one here.
        {
          id: 'canvas-user-task-3',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:3',
            name: 'test',
          },
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    // This is the point where we have passed the check. Now it will create the crowdsourcing task.

    db.mockQuery(
      projectModelQuery,
      {
        task_id: mockProject.task_id,
        capture_model_id: mockProject.capture_model_id,
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
      '/api/crowdsourcing/model?derived_from=model-id&target_id=urn%3Amadoc%3Acanvas%3A123&target_type=Canvas',
      [
        {
          id: 'some-model',
        },
      ]
    );

    apiMock.mockRoute('GET', '/api/crowdsourcing/model/some-model', {
      id: 'some-model',
    });

    // And now we assert that the task created is what we expect.
    apiMock.mockRoute('POST', '/api/tasks/canvas-crowd-task-1/subtasks', {}, body => {
      expect(body).toMatchInlineSnapshot(`
        Object {
          "assignee": Object {
            "id": "urn:madoc:user:1",
            "name": "test",
          },
          "context": Array [
            "urn:madoc:project:1",
          ],
          "events": Array [
            "madoc-ts.status.-1",
            "madoc-ts.status.2",
            "madoc-ts.status.3",
            "madoc-ts.status.4",
          ],
          "name": "test: submission undefined",
          "parameters": Array [
            "some-model",
            null,
            "canvas",
          ],
          "state": Object {
            "userManifestTask": "manifest-crowd-task-2",
          },
          "status": 0,
          "status_text": "assigned",
          "subject": "urn:madoc:canvas:123",
          "subject_parent": "urn:madoc:manifest:456",
          "type": "crowdsourcing-task",
        }
      `);
    });

    apiMock.mockRoute('PATCH', '/api/tasks/manifest-crowd-task-2', {}, body => {
      expect(body).toMatchInlineSnapshot(`
        Object {
          "status": 1,
          "status_text": "in progress",
        }
      `);
    });

    // Mocks.
    await createResourceClaim(ctx);

    apiMock.assertEmpty();
    db.assertEmpty();
  });

  test('User cannot update claim that has errored (config)', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = new KoaContextMock()
      .withUser({ id: 1, name: 'test' })
      .withParams({
        id: 1,
      })
      .withRequestBody({
        manifestId: 456,
        canvasId: 123,
      })
      .withScope(['models.contribute'])
      .get();

    db.attachMock(ctx);

    const projectConfiguration: ProjectFull['config'] = {
      claimGranularity: 'canvas',
      modelPageOptions: {
        preventContributionAfterRejection: true,
      },
    };

    const project = createProjectMock(projectConfiguration);

    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // Start of mocks.

    apiMock.mockRoute('GET', '/api/madoc/projects/1', project);
    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/456/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(countManifestsQuery, { item_id: 1, rowCount: 1 });
    db.mockQuery(countCollectionQuery, { item_id: 1, rowCount: 1 });
    apiMock.mockConfigRequest(1, projectConfiguration);
    db.mockQuery(projectTaskQuery, { task_id: 'project-task-id', collection_id: 1 });

    // Limit has been reached, so our project task needs to contain a manifest task.
    apiMock.mockRoute('GET', '/api/tasks/project-task-id?all=true&assignee=true&detail=true', {
      id: 'project-task-id',
      subtasks: [
        {
          id: 'manifest-crowd-task-1',
          type: 'crowdsourcing-manifest-task',
          subject: 'urn:madoc:manifest:456',
          state: {
            // Can start adding to this as we need.
            maxContributors: 2,
            approvalsRequired: 1,
          },
        },
      ],
    });
    // In the manifest task, we need a user manifest task assigned to the user.
    apiMock.mockRoute('GET', '/api/tasks/manifest-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'manifest-crowd-task-1',
      type: 'crowdsourcing-manifest-task',
      subject: 'urn:madoc:manifest:456',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // Canvases
        {
          id: 'canvas-crowd-task-1',
          type: 'crowdsourcing-task',
          status: 1,
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    apiMock.mockRoute('GET', '/api/tasks/canvas-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'canvas-crowd-task-1',
      type: 'crowdsourcing-canvas-task',
      subject: 'urn:madoc:canvas:123',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // One task by this user, but its status is -1
        {
          id: 'canvas-user-task-3',
          type: 'crowdsourcing-task',
          status: -1,
          assignee: {
            id: 'urn:madoc:user:1',
            name: 'test',
          },
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    // This is the point where we have passed the check. Now it will create the crowdsourcing task.

    // Mocks.
    await expect(() => createResourceClaim(ctx)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Maximum number of contributors reached"`
    );

    apiMock.assertEmpty();
    db.assertEmpty();
  });

  test('User cannot update claim that has been submitted (config)', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = new KoaContextMock()
      .withUser({ id: 1, name: 'test' })
      .withParams({
        id: 1,
      })
      .withRequestBody({
        manifestId: 456,
        canvasId: 123,
        status: 1,
        revisionId: 'revision-123',
      })
      .withScope(['models.contribute'])
      .get();

    db.attachMock(ctx);

    const projectConfiguration: ProjectFull['config'] = {
      claimGranularity: 'canvas',
      modelPageOptions: {
        preventContributionAfterSubmission: true,
      },
    };

    const project = createProjectMock(projectConfiguration);

    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // Start of mocks.

    apiMock.mockRoute('GET', '/api/madoc/projects/1', project);
    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/456/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(countManifestsQuery, { item_id: 1, rowCount: 1 });
    db.mockQuery(countCollectionQuery, { item_id: 1, rowCount: 1 });
    apiMock.mockConfigRequest(1, projectConfiguration);
    db.mockQuery(projectTaskQuery, { task_id: 'project-task-id', collection_id: 1 });

    // Limit has been reached, so our project task needs to contain a manifest task.
    apiMock.mockRoute('GET', '/api/tasks/project-task-id?all=true&assignee=true&detail=true', {
      id: 'project-task-id',
      subtasks: [
        {
          id: 'manifest-crowd-task-1',
          type: 'crowdsourcing-manifest-task',
          subject: 'urn:madoc:manifest:456',
          state: {
            // Can start adding to this as we need.
            maxContributors: 2,
            approvalsRequired: 1,
          },
        },
      ],
    });
    // In the manifest task, we need a user manifest task assigned to the user.
    apiMock.mockRoute('GET', '/api/tasks/manifest-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'manifest-crowd-task-1',
      type: 'crowdsourcing-manifest-task',
      subject: 'urn:madoc:manifest:456',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // Canvases
        {
          id: 'canvas-crowd-task-1',
          type: 'crowdsourcing-task',
          status: 1,
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    apiMock.mockRoute('GET', '/api/tasks/canvas-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'canvas-crowd-task-1',
      type: 'crowdsourcing-canvas-task',
      subject: 'urn:madoc:canvas:123',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // One task by this user, but its status is -1
        {
          id: 'canvas-user-task-3',
          type: 'crowdsourcing-task',
          status: 2, // 2 = in review
          state: {
            revisionId: 'revision-123',
          },
          assignee: {
            id: 'urn:madoc:user:1',
            name: 'test',
          },
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    // This is the point where we have passed the check. Now it will create the crowdsourcing task.

    // Mocks.
    await expect(() => createResourceClaim(ctx)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Cannot update task in review"`
    );

    apiMock.assertEmpty();
    db.assertEmpty();
  });

  test('User cannot submit more than one revision (config)', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = new KoaContextMock()
      .withUser({ id: 1, name: 'test' })
      .withParams({
        id: 1,
      })
      .withRequestBody({
        manifestId: 456,
        canvasId: 123,
        status: 1,
        revisionId: 'revision-456',
      })
      .withScope(['models.contribute'])
      .get();

    db.attachMock(ctx);

    const projectConfiguration: ProjectFull['config'] = {
      claimGranularity: 'canvas',
      modelPageOptions: {
        preventMultipleUserSubmissionsPerResource: true,
      },
    };

    const project = createProjectMock(projectConfiguration);

    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // Start of mocks.

    apiMock.mockRoute('GET', '/api/madoc/projects/1', project);
    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/456/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(countManifestsQuery, { item_id: 1, rowCount: 1 });
    db.mockQuery(countCollectionQuery, { item_id: 1, rowCount: 1 });
    apiMock.mockConfigRequest(1, projectConfiguration);
    db.mockQuery(projectTaskQuery, { task_id: 'project-task-id', collection_id: 1 });

    // Limit has been reached, so our project task needs to contain a manifest task.
    apiMock.mockRoute('GET', '/api/tasks/project-task-id?all=true&assignee=true&detail=true', {
      id: 'project-task-id',
      subtasks: [
        {
          id: 'manifest-crowd-task-1',
          type: 'crowdsourcing-manifest-task',
          subject: 'urn:madoc:manifest:456',
          state: {
            // Can start adding to this as we need.
            maxContributors: 2,
            approvalsRequired: 1,
          },
        },
      ],
    });
    // In the manifest task, we need a user manifest task assigned to the user.
    apiMock.mockRoute('GET', '/api/tasks/manifest-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'manifest-crowd-task-1',
      type: 'crowdsourcing-manifest-task',
      subject: 'urn:madoc:manifest:456',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // Canvases
        {
          id: 'canvas-crowd-task-1',
          type: 'crowdsourcing-task',
          status: 1,
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    apiMock.mockRoute('GET', '/api/tasks/canvas-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'canvas-crowd-task-1',
      type: 'crowdsourcing-canvas-task',
      subject: 'urn:madoc:canvas:123',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // One task by this user, but its status is -1
        {
          id: 'canvas-user-task-3',
          type: 'crowdsourcing-task',
          status: 2, // 2 = in review
          state: {
            revisionId: 'revision-123',
          },
          assignee: {
            id: 'urn:madoc:user:1',
            name: 'test',
          },
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    // This is the point where we have passed the check. Now it will create the crowdsourcing task.

    // Mocks.
    await expect(() => createResourceClaim(ctx)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Maximum number of contributors reached"`
    );

    apiMock.assertEmpty();
    db.assertEmpty();
  });

  test('User cannot create new claim on canvas if unassigned from manifest task', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = new KoaContextMock()
      .withUser({ id: 1, name: 'test' })
      .withParams({
        id: 1,
      })
      .withRequestBody({
        manifestId: 456,
        canvasId: 123,
      })
      .withScope(['models.contribute'])
      .get();

    db.attachMock(ctx);

    const projectConfiguration: ProjectFull['config'] = {
      claimGranularity: 'manifest',
    };

    const project = createProjectMock(projectConfiguration);

    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // Start of mocks.

    apiMock.mockRoute('GET', '/api/madoc/projects/1', project);
    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/456/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(countManifestsQuery, { item_id: 1, rowCount: 1 });
    db.mockQuery(countCollectionQuery, { item_id: 1, rowCount: 1 });
    apiMock.mockConfigRequest(1, projectConfiguration);
    db.mockQuery(projectTaskQuery, { task_id: 'project-task-id', collection_id: 1 });

    // Limit has been reached, so our project task needs to contain a manifest task.
    apiMock.mockRoute('GET', '/api/tasks/project-task-id?all=true&assignee=true&detail=true', {
      id: 'project-task-id',
      subtasks: [
        {
          id: 'manifest-crowd-task-1',
          type: 'crowdsourcing-manifest-task',
          subject: 'urn:madoc:manifest:456',
          state: {
            // Can start adding to this as we need.
            maxContributors: 2,
            approvalsRequired: 1,
          },
        },
      ],
    });
    // In the manifest task, we need a user manifest task assigned to the user.
    apiMock.mockRoute('GET', '/api/tasks/manifest-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'manifest-crowd-task-1',
      type: 'crowdsourcing-manifest-task',
      subject: 'urn:madoc:manifest:456',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // Manifest claims
        {
          id: 'manifest-crowd-task-2',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:2', // assigned to a different user.
            name: 'test',
          },
          subject: 'urn:madoc:manifest:456',
        },
        {
          id: 'manifest-crowd-task-3',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:3',
            name: 'test',
          },
          subject: 'urn:madoc:manifest:456',
        },

        // Canvases
        {
          id: 'canvas-crowd-task-1',
          type: 'crowdsourcing-task',
          status: 1,
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    apiMock.mockRoute('GET', '/api/tasks/canvas-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'canvas-crowd-task-1',
      type: 'crowdsourcing-canvas-task',
      subject: 'urn:madoc:canvas:123',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // One other task created by another user.
        // We want to verify that a user is allowed to make one here.
        {
          id: 'canvas-user-task-3',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:3',
            name: 'test',
          },
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    // Mocks.
    await expect(() => createResourceClaim(ctx)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Maximum number of contributors reached"`
    );

    expect(db.queueSize()).toEqual(0);

    apiMock.assertEmpty();
    db.assertEmpty();
  });

  test('User can continue their submission even after being unassigned from manifest', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = new KoaContextMock()
      .withUser({ id: 1, name: 'test' })
      .withParams({
        id: 1,
      })
      .withRequestBody({
        manifestId: 456,
        canvasId: 123,
        revisionId: 'some-revision-id',
        status: 2,
      })
      .withScope(['models.contribute'])
      .get();

    db.attachMock(ctx);

    const projectConfiguration: ProjectFull['config'] = {
      claimGranularity: 'manifest',
    };

    const project = createProjectMock(projectConfiguration);

    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // Start of mocks.

    apiMock.mockRoute('GET', '/api/madoc/projects/1', project);
    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/456/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(countManifestsQuery, { item_id: 1, rowCount: 1 });
    db.mockQuery(countCollectionQuery, { item_id: 1, rowCount: 1 });
    apiMock.mockConfigRequest(1, projectConfiguration);
    db.mockQuery(projectTaskQuery, { task_id: 'project-task-id', collection_id: 1 });

    // Limit has been reached, so our project task needs to contain a manifest task.
    apiMock.mockRoute('GET', '/api/tasks/project-task-id?all=true&assignee=true&detail=true', {
      id: 'project-task-id',
      subtasks: [
        {
          id: 'manifest-crowd-task-1',
          type: 'crowdsourcing-manifest-task',
          subject: 'urn:madoc:manifest:456',
          state: {
            // Can start adding to this as we need.
            maxContributors: 2,
            approvalsRequired: 1,
          },
        },
      ],
    });
    // In the manifest task, we need a user manifest task assigned to the user.
    apiMock.mockRoute('GET', '/api/tasks/manifest-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'manifest-crowd-task-1',
      type: 'crowdsourcing-manifest-task',
      subject: 'urn:madoc:manifest:456',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // Manifest claims
        {
          id: 'manifest-crowd-task-2',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:2', // assigned to a different user.
            name: 'test',
          },
          subject: 'urn:madoc:manifest:456',
        },
        {
          id: 'manifest-crowd-task-3',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:3',
            name: 'test',
          },
          subject: 'urn:madoc:manifest:456',
        },

        // Canvases
        {
          id: 'canvas-crowd-task-1',
          type: 'crowdsourcing-task',
          status: 1,
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    apiMock.mockRoute('GET', '/api/tasks/canvas-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'canvas-crowd-task-1',
      type: 'crowdsourcing-canvas-task',
      subject: 'urn:madoc:canvas:123',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // User started this task, but has been assigned.
        {
          id: 'canvas-user-task-3',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:1',
            name: 'test',
          },
          state: {
            revisionId: 'some-revision-id',
          },
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    // Check that it correctly updates the status.
    apiMock.mockRoute('PATCH', '/api/tasks/canvas-user-task-3', {}, body => {
      expect(body).toMatchInlineSnapshot(`
        Object {
          "status": 2,
          "status_text": "Submitted",
        }
      `);
    });

    // Mocks.
    await createResourceClaim(ctx);

    apiMock.assertEmpty();
    db.assertEmpty();
  });

  test.skip('User cannot continue their submission even after being unassigned from manifest (config)', async () => {
    const apiMock = new ApiMock();
    const db = new DatabaseMock();

    const ctx = new KoaContextMock()
      .withUser({ id: 1, name: 'test' })
      .withParams({
        id: 1,
      })
      .withRequestBody({
        manifestId: 456,
        canvasId: 123,
        revisionId: 'some-revision-id',
        status: 2,
      })
      .withScope(['models.contribute'])
      .get();

    db.attachMock(ctx);

    const projectConfiguration: ProjectFull['config'] = {
      claimGranularity: 'manifest',
      modelPageOptions: {
        preventContributionAfterManifestUnassign: true,
      },
    };

    const project = createProjectMock(projectConfiguration);

    const { createResourceClaim } = require('../../src/routes/projects/create-resource-claim');

    // Start of mocks.

    apiMock.mockRoute('GET', '/api/madoc/projects/1', project);
    apiMock.mockRoute('GET', '/api/madoc/iiif/manifests/456/collections?project_id=1', {
      collections: [],
    });

    db.mockQuery(countManifestsQuery, { item_id: 1, rowCount: 1 });
    db.mockQuery(countCollectionQuery, { item_id: 1, rowCount: 1 });
    apiMock.mockConfigRequest(1, projectConfiguration);
    db.mockQuery(projectTaskQuery, { task_id: 'project-task-id', collection_id: 1 });

    // Limit has been reached, so our project task needs to contain a manifest task.
    apiMock.mockRoute('GET', '/api/tasks/project-task-id?all=true&assignee=true&detail=true', {
      id: 'project-task-id',
      subtasks: [
        {
          id: 'manifest-crowd-task-1',
          type: 'crowdsourcing-manifest-task',
          subject: 'urn:madoc:manifest:456',
          state: {
            // Can start adding to this as we need.
            maxContributors: 2,
            approvalsRequired: 1,
          },
        },
      ],
    });
    // In the manifest task, we need a user manifest task assigned to the user.
    apiMock.mockRoute('GET', '/api/tasks/manifest-crowd-task-1?all=true&assignee=true&detail=true', {
      id: 'manifest-crowd-task-1',
      type: 'crowdsourcing-manifest-task',
      subject: 'urn:madoc:manifest:456',
      state: {
        // Can start adding to this as we need.
        maxContributors: 2,
        approvalsRequired: 1,
      },
      subtasks: [
        // Manifest claims
        {
          id: 'manifest-crowd-task-2',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:2', // assigned to a different user.
            name: 'test',
          },
          subject: 'urn:madoc:manifest:456',
        },
        {
          id: 'manifest-crowd-task-3',
          type: 'crowdsourcing-task',
          status: 1,
          assignee: {
            id: 'urn:madoc:user:3',
            name: 'test',
          },
          subject: 'urn:madoc:manifest:456',
        },

        // Canvases
        {
          id: 'canvas-crowd-task-1',
          type: 'crowdsourcing-task',
          status: 1,
          subject: 'urn:madoc:canvas:123',
        },
      ],
    });

    await expect(() => createResourceClaim(ctx)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"You must claim a manifest to continue working on this canvas"`
    );

    apiMock.assertEmpty();
    db.assertEmpty();
  });
});
