import { promises as fs, existsSync } from 'fs';
import { dirname, join, basename } from 'path';
import AdmZip from 'adm-zip';
import {
  ExportDataOptions,
  ExportFileDefinition,
  ExportPlan,
  ExportResourceRequest,
  SupportedExportResource,
  SupportedExportResourceTypes,
} from '../../extensions/project-export/types';
import { generateId } from '../../frontend/shared/capture-models/helpers/generate-id';
import { EXPORT_PATH, STORAGE_API_PATH } from '../../paths';
import { parseUrn } from '../../utility/parse-urn';
import { ApiClient, ApiClientWithoutExtensions } from '../api';
import { getSiteApi } from '../helpers/get-site-api';
import { BaseTask } from './base-task';

export const type = 'export-resource-task';

export const status = [
  // 0 - not started
  'requested',
  // 1 - accepted
  'export scheduled',
  // 2 - in progress
  'export running',
  // 3 - done
  'success',
] as const;

export interface ExportResourceTask extends BaseTask {
  type: 'export-resource-task';
  parameters: [ExportResourceRequest, { siteId: number; userId: number }];
  status: -1 | 0 | 1 | 2 | 3;
  state: {
    output?: any;
    empty?: boolean;
    didError?: boolean;
    errorMessage?: string;
  };
}

export function createTask(
  request: ExportResourceRequest,
  userId: number,
  siteId: number,
  // Other Misc
  {
    label,
    summary,
  }: {
    label?: string;
    summary?: string;
  } = {}
): ExportResourceTask {
  const subject = `urn:madoc:${request.subject.type}:${request.subject.id}`;
  const subject_parent = request.subjectParent
    ? `urn:madoc:${request.subjectParent.type}:${request.subjectParent.id}`
    : 'none';

  return {
    name: label || `Export task`,
    description: summary || '',
    type,
    subject,
    subject_parent,
    status: 0,
    status_text: status[0],
    parameters: [
      request,
      {
        userId: userId,
        siteId: siteId,
      },
    ],
    state: {},
    events: [
      // To set up the export.
      'madoc-ts.created',

      // For sub-tasks.
      'madoc-ts.subtask_type_status.export-resource-task.3',

      // When it's complete
      'madoc-ts.status.3',
    ],
  };
}

async function getSubjectManifests(
  subject: SupportedExportResource,
  plan: ExportPlan,
  siteApi: ApiClientWithoutExtensions
): Promise<Array<{ id: number }>> {
  if (subject.type === 'project' && plan.manifest && (plan.manifest.length || plan.canvas.length)) {
    const manifests = await siteApi.getProjectStructure(subject.id);
    return manifests.items.filter(item => item.type === 'manifest');
  }
  return [];
}

async function getSubjectCanvases(
  subject: SupportedExportResource,
  plan: ExportPlan,
  siteApi: ApiClientWithoutExtensions
): Promise<Array<{ id: number }>> {
  if (subject.type === 'manifest' && plan.canvas && plan.canvas.length) {
    const canvases = await siteApi.getManifestStructure(subject.id);
    return canvases.items;
  }
  return [];
}

function getSubRequestOutput(output: ExportResourceRequest['output']): ExportResourceRequest['output'] {
  if (output) {
    if (output.type === 'zip') {
      return {
        type: 'disk',
        directory: output.options.tempDir,
      };
    }

    return output;
  }

  return { type: 'none' };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      await api.acceptTask<ExportResourceTask>(taskId);
      const task = await api.getTask<ExportResourceTask>(taskId, { detail: true });
      const [request, { siteId, userId }] = task.parameters;
      const subject = parseUrn<SupportedExportResource>(task.subject);
      const subjectParent = task.subject_parent ? parseUrn<SupportedExportResource>(task.subject_parent) : undefined;
      const files: ExportFileDefinition[] = [];
      const output = getSubRequestOutput(request.output);

      console.log('=> accepting export task', task.id);

      if (siteId && subject) {
        console.log('=> found site + subject', task.id);
        const siteApi = await getSiteApi(api, { siteId, userId }, true);
        try {
          const definitions = siteApi.projectExport.getAllDefinitions(siteId);

          const plan = request.exportPlan;
          if (plan) {
            console.log('=> found plan', plan);
            const subtasks: ExportResourceTask[] = [];
            const subjectManifests = await getSubjectManifests(subject, plan, siteApi);
            const subjectCanvases = await getSubjectCanvases(subject, plan, siteApi);

            console.log('=> found subject exports', request.subjectExports);
            if (request.subjectExports) {
              // If there are subject exports - then we just run these.
              for (const [resourceTaskId, options] of request.subjectExports) {
                const definition = definitions.find(r => r.type === resourceTaskId);
                if (definition) {
                  const exportDataOptions: ExportDataOptions = {
                    api: siteApi as any,
                    config: options,
                    subjectParent,
                    task,
                    context: request.context || subjectParent,
                    subExport: (exportType: string, exportSubject: SupportedExportResource, config?: any) => {
                      // I don't remember what this is for.
                      subtasks.push(
                        createTask(
                          {
                            context: request.context,
                            subject: exportSubject,
                            subjectParent: subject,
                            exportPlan: request.exportPlan,
                            subjectExports: [[exportType, config]],
                            output,
                            standalone: true,
                          },
                          userId,
                          siteId,
                          {}
                        )
                      );
                    },
                  };
                  const exportedData = await definition.exportData(subject, exportDataOptions);
                  if (exportedData) {
                    files.push(...exportedData);
                  }
                }
              }
            }

            const resourceTypes = Object.keys(plan) as SupportedExportResourceTypes[];
            for (const resourceType of resourceTypes) {
              const allPlans = plan[resourceType];
              // If it's a standalone export - then we DON'T go through the sub-tasks.
              if (!request.standalone) {
                console.log('=> Fan out manifests', { resourceType, subject, total: subjectManifests.length });
                // Fan out for manifests.
                if (subject.type === 'project' && resourceType === 'manifest') {
                  // Then fan out to project manifests.
                  for (const manifest of subjectManifests) {
                    // Create new sub-task.
                    subtasks.push(
                      createTask(
                        {
                          context: request.context,
                          subject: { id: manifest.id, type: 'manifest' },
                          subjectParent: subject,
                          exportPlan: request.exportPlan,
                          subjectExports: allPlans,
                          output,
                        },
                        userId,
                        siteId,
                        {}
                      )
                    );
                  }
                  continue;
                }

                console.log('=> Fan out canvases', { resourceType, subject, total: subjectCanvases.length });
                if (subject.type === 'manifest' && resourceType === 'canvas') {
                  // Then fan out to manifest canvases.
                  for (const canvas of subjectCanvases) {
                    subtasks.push(
                      createTask(
                        {
                          context: request.context,
                          subject: { id: canvas.id, type: 'canvas' },
                          subjectParent: subject,
                          exportPlan: request.exportPlan,
                          subjectExports: allPlans,
                          output,
                        },
                        userId,
                        siteId,
                        {}
                      )
                    );
                  }
                }
              }
            }

            // 1. Handle subtasks.
            if (subtasks.length) {
              console.log(`=> found ${subtasks.length} sub tasks to add`);
              await api.addSubtasks(subtasks, task.id);
            }

            // 2. Handle files
            if (files.length && request.output && request.output.type !== 'none') {
              console.log(`=> found ${files.length} files to add`);

              let renderOutput = { ...request.output };
              if (request.output.type === 'zip') {
                renderOutput = {
                  type: 'disk',
                  directory: request.output.options.tempDir,
                };
              }

              switch (renderOutput.type) {
                case 'task-state': {
                  // Save files to task state...
                  await api.updateTask(task.id, { state: { files } });
                  break;
                }
                case 'disk': {
                  // This could be moved out.
                  if (renderOutput.directory.startsWith('..')) {
                    throw new Error('Invalid output path');
                  }
                  // Save files to disk...
                  // 1. Make sure the directory exists.
                  const root = join(EXPORT_PATH, renderOutput.directory);
                  if (!existsSync(root)) {
                    await fs.mkdir(root, { recursive: true });
                  }

                  for (const file of files) {
                    const filePath = join(root, file.path);
                    const fileDir = dirname(filePath);

                    // 2. Ensure new file directory exists.
                    if (!existsSync(fileDir)) {
                      await fs.mkdir(fileDir, { recursive: true });
                    }

                    // 3. Write each file.
                    if (file.content) {
                      switch (file.content.type) {
                        case 'url': {
                          // Need to fetch.
                          const response = await fetch(file.content.value);
                          await fs.writeFile(filePath, response.body, { encoding: file.encoding });
                          break;
                        }
                        case 'html':
                        case 'text': {
                          await fs.writeFile(filePath, file.content.value, { encoding: file.encoding });
                          break;
                        }
                      }
                    }
                  }
                  break;
                }
                case 'zip': {
                  // This will be handled in the complete step.
                  break;
                }
              }
            }

            // 3. Mark as done if there are no subtasks.
            if (subtasks.length === 0) {
              await api.updateTask(task.id, { status: 3, status_text: 'completed' });
            }
          }
        } catch (e) {
          siteApi.dispose();
          throw e;
        }

        siteApi.dispose();

        return;
      }

      break;
    }

    case 'subtask_type_status.export-resource-task.3': {
      // There MIGHT be things we need to do to aggregate these in the future.
      // For now the only supported aggregation is the zip + files.
      // Only thing we can do is mark the task as complete, so it falls into the next step.
      const task = await api.getTask<ExportResourceTask>(taskId);
      await api.updateTask(task.id, { status: 3, status_text: 'completed' });
      return;
    }

    case 'status.3': {
      const task = await api.getTask<ExportResourceTask>(taskId);
      const [request, { siteId, userId }] = task.parameters;
      if (siteId) {
        const userApi = api.asUser({ siteId, userId });

        if (request.output.type === 'zip') {
          const outputDir = join(STORAGE_API_PATH, `urn:madoc:site:${siteId}`, 'export', request.output.path);
          if (!existsSync(outputDir)) {
            await fs.mkdir(outputDir, { recursive: true });
          }
          const outputFile = join(outputDir, request.output.fileName);
          const tempDir = join(EXPORT_PATH, request.output.options.tempDir);
          const zip = new AdmZip();
          const folderPath = basename(request.output.fileName, '.zip');
          // if (existsSync(tempDir)) {
          // try {
          zip.addLocalFolder(tempDir, folderPath);
          await new Promise(resolve => zip.writeZip(outputFile, resolve));
          // } catch (e) {
          //   // No zip.
          //   await api.updateTask(task.id, { state: { empty: true } });
          // }

          try {
            if (tempDir) {
              await fs.rmdir(tempDir, { recursive: true });
            }
          } catch (e) {
            // ignore error.
          }

          await userApi.notifications.createNotification({
            id: generateId(),
            title: 'Finished exporting',
            summary: task.subject,
            action: {
              id: 'task:admin',
              link: `urn:madoc:task:${taskId}`,
            },
            user: userId,
          });
        }
      }

      break;
    }
  }
};
