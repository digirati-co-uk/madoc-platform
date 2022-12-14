import { ApiClient } from '../api';
import { BaseTask } from './base-task';
import { ImportCanvasTask } from './import-canvas';

export const type = 'search-index-task';

export interface SearchIndexTask extends BaseTask {
  type: 'search-index-task';

  /**
   * Parameters:
   *   - Site id
   *   - List of resources
   *   - Options
   */
  parameters: [
    Array<{ id: number; type: string }>,
    { indexAllResources?: boolean; recursive?: boolean; resourceStack?: number[] } | undefined,
    number
  ];

  status: -1 | 0 | 1 | 2 | 3 | 4;

  state: {
    indexedResources: { [type: string]: number[] };
  };
}

export function createTask(
  resources: Array<{ id: number; type: string }>,
  siteId: number,
  {
    recursive = true,
    indexAllResources,
    resourceStack,
  }: { indexAllResources?: boolean; recursive?: boolean; resourceStack?: number[] } = {}
): SearchIndexTask {
  return {
    type: 'search-index-task',
    name: `Indexing ${resources.length} resources`,
    parameters: [
      resources,
      {
        indexAllResources,
        resourceStack,
        recursive,
      },
      siteId,
    ],
    state: {
      indexedResources: {},
    },
    events: [
      'madoc-ts.created',
      `madoc-ts.subtask_type_status.search-index-task.3`,
      `madoc-ts.subtask_type_status.search-index-task.1`,
      `madoc-ts.status.1`,
    ],
    subject: `none`,
    status: 0,
    status_text: 'pending',
  };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      try {
        const task = await api.getTask<SearchIndexTask>(taskId);
        const [resources, options = {}, siteId] = task.parameters;
        const { indexAllResources = false, recursive = true, resourceStack = [] } = options;
        const siteApi = api.asUser({ siteId });

        if (resources.length === 0) {
          // Invalid.
          // @todo indexAllResources might be set.
          break;
        }

        if (resources.length > 1) {
          // Create sub-task for each
          const subtasks: SearchIndexTask[] = [];
          for (const item of resources) {
            subtasks.push(createTask([item], siteId, options));
          }

          await api.addSubtasks(subtasks, taskId);

          break;
        }

        const resource = resources[0];

        switch (resource.type) {
          case 'manifest': {
            try {
              //   - Create task for each canvas as sub tasks.
              const manifestStructure = await siteApi.getManifestStructure(resource.id);

              if (recursive) {
                const subtasks: SearchIndexTask[] = [];
                for (const item of manifestStructure.items) {
                  subtasks.push(createTask([{ id: item.id, type: 'canvas' }], siteId, options));
                }

                if (subtasks.length) {
                  await api.addSubtasks(subtasks, taskId);
                  break;
                }
              }
            } catch (e) {
              // ignore error.
            }

            break;
          }

          case 'canvas': {
            // Do nothing...
            break;
          }

          case 'collection': {
            try {
              //   - Create task for each canvas as sub tasks.
              const collectionStructure = await siteApi.getCollectionStructure(resource.id);

              if (recursive) {
                const subtasks: SearchIndexTask[] = [];
                for (const item of collectionStructure.items) {
                  if (item.type) {
                    subtasks.push(createTask([{ id: item.id, type: item.type?.toLowerCase() }], siteId, options));
                  }
                }

                if (subtasks.length) {
                  await api.addSubtasks(subtasks, taskId);
                  break;
                }
              }
            } catch (e) {
              // ignore error.
            }

            break;
          }
        }
      } catch (err) {
        // no-op
      }

      // Trigger a deferred index.
      await api.updateTask<ImportCanvasTask>(taskId, { status: 1 });

      break;
    }
    case 'subtask_type_status.search-index-task.1': {
      await api.updateTask<ImportCanvasTask>(taskId, { status: 2 });
      break;
    }
    case 'status.1': {
      try {
        const task = await api.getTask<SearchIndexTask>(taskId);
        const [resources, options = {}, siteId] = task.parameters;
        const { indexAllResources = false, recursive = true, resourceStack = [] } = options;
        const siteApi = api.asUser({ siteId });

        if (resources.length !== 1) {
          // Invalid.
          break;
        }

        const resource = resources[0];
        switch (resource.type) {
          case 'manifest': {
            try {
              // Ingest manifest.
              await siteApi.indexManifest(resource.id);
              // And mark as done.
              await api.updateTask(taskId, { status: 3 });
            } catch (e) {
              // ignore error.
            }

            break;
          }

          case 'canvas': {
            try {
              //  - Ingest canvas.
              await siteApi.indexCanvas(resource.id);
              //  - Mark as done.
              await api.updateTask(taskId, { status: 3 });
            } catch (e) {
              // Ignore errors.
            }

            break;
          }

          case 'collection': {
            // @todo ingest collection.
            //  - Ingest collection.
            break;
          }
        }
      } catch (err) {
        // no-op
      }
      break;
    }

    case `subtask_type_status.${type}.3`: {
      const task = await api.getTask<SearchIndexTask>(taskId);

      const [resources] = task.parameters;

      if (resources.length !== 1) {
        await api.updateTask(taskId, { status: 3 });
        break;
      }

      const resource = resources[0];
      if (resource.type === 'manifest') {
        await api.deleteSubtasks(task.id);
      }

      await api.updateTask(taskId, { status: 3 });

      break;
    }
  }
};
