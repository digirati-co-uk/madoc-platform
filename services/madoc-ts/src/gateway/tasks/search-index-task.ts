import { ApiClient } from '../api';
import { BaseTask } from './base-task';

export const type = 'search-index-task';

export type SearchIndexResource = {
  id: number;
  type: string;
  indexId?: string;
};

export interface SearchIndexTask extends BaseTask {
  type: 'search-index-task';

  /**
   * Parameters:
   *   - Site id
   *   - List of resources
   *   - Options
   */
  parameters: [
    SearchIndexResource[],
    { indexAllResources?: boolean; recursive?: boolean; resourceStack?: number[] } | undefined,
    number,
  ];

  status: -1 | 0 | 1 | 2 | 3 | 4;

  state: {
    indexedResources: { [type: string]: number[] };
  };
}

export function createTask(
  resources: SearchIndexResource[],
  siteId: number,
  {
    recursive = false,
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
    events: ['madoc-ts.created', `madoc-ts.subtask_type_status.search-index-task.3`],
    subject: `none`,
    status: 0,
    status_text: 'pending',
  };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      try {
        const task = await api.acceptTask<SearchIndexTask>(taskId);
        const [resources, options = {}, siteId] = task.parameters;
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
              //   - Ingest manifest.
              const manifestIndexResult = (await api.indexManifest(resource.id)) as any;

              if (manifestIndexResult?.noSearch) {
                await api.updateTask(taskId, { status: 3 });
                break;
              }

              // Manifest indexing now performs combined manifest + canvas indexing for Typesense.
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

              // @todo check for OCR + capture models?

              //  - Mark as done.
              await api.updateTask(taskId, { status: 3 });
            } catch (e) {
              // Ignore errors.
            }

            break;
          }

          case 'collection': {
            try {
              await siteApi.indexCollection(resource.id);
              await api.updateTask(taskId, { status: 3 });
            } catch {
              // Ignore errors.
            }
            break;
          }

          case 'project': {
            try {
              await siteApi.indexProject(resource.id);
              await api.updateTask(taskId, { status: 3 });
            } catch {
              // Ignore errors.
            }
            break;
          }

          case 'project-entity-index': {
            if (!resource.indexId) {
              await api.updateTask(taskId, { status: -1, status_text: 'Missing project search index id' });
              throw new Error('Missing project search index id');
            }
            try {
              await siteApi.indexProjectSearchIndex(resource.id, resource.indexId);
              await api.updateTask(taskId, { status: 3, status_text: 'Indexed' });
            } catch (error) {
              await api.updateTask(taskId, { status: -1, status_text: 'Failed' });
              throw error;
            } finally {
              siteApi.dispose();
            }
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
