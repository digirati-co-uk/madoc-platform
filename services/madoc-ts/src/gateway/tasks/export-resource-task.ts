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
import { publishCsvArchive } from '../../extensions/project-export/publish-csv-archive';

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
    expectedSubtasks?: number;
    failedResources?: string[];
    outputPaths?: string[];
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
      'madoc-ts.subtask_type_status.export-resource-task.-1',

      // When it's complete
      'madoc-ts.status.3',
      ...(hasManifestCsv(request.exportPlan) ? ['madoc-ts.status.-1'] : []),
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

async function directoryHasFiles(directory: string): Promise<boolean> {
  if (!existsSync(directory)) {
    return false;
  }

  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      return true;
    }
    if (entry.isDirectory()) {
      if (await directoryHasFiles(join(directory, entry.name))) {
        return true;
      }
    }
  }

  return false;
}

function hasManifestCsv(plan?: ExportPlan): boolean {
  return !!plan?.manifest?.some(([exportType]) => exportType === 'manifest-csv-contributions-export');
}

/** A partial archive is ready only after every expected child has settled. */
export function getManifestCsvCompletion(task: ExportResourceTask): { failedResources: string[] } | undefined {
  const children = task.subtasks || [];
  if (
    task.state.expectedSubtasks === undefined ||
    children.length !== task.state.expectedSubtasks ||
    children.some(child => child.status !== 3 && child.status !== -1)
  ) {
    return undefined;
  }
  return {
    failedResources: children
      .filter(child => {
        if (child.status === -1 || child.state?.didError) return true;
        const subject = parseUrn<SupportedExportResource>(child.subject);
        const context = task.parameters[0].context;
        // Explicitly report completed manifest children with missing CSV output as partial failures.
        return (
          subject?.type === 'manifest' &&
          context.type === 'project' &&
          !child.state?.outputPaths?.includes(`/manifests/${subject.id}/csv/${context.id}/contributions.csv`)
        );
      })
      .map(child => child.subject),
  };
}

async function reconcileManifestCsvTask(taskId: string, api: ApiClient): Promise<void> {
  const task = await api.getTask<ExportResourceTask>(taskId, { all: true, detail: true });
  if (task.status === 3 || !hasManifestCsv(task.parameters[0].exportPlan)) return;
  const result = getManifestCsvCompletion(task);
  if (!result) return;
  const didError = result.failedResources.length > 0;
  await api.updateTask(taskId, {
    status: 3,
    status_text: didError ? 'completed with errors' : 'completed',
    state: {
      ...task.state,
      didError,
      failedResources: result.failedResources,
      ...(didError
        ? { errorMessage: 'Some resources failed or have missing output. See the subtasks and README-errors.txt.' }
        : {}),
    },
  });
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
              if (!hasManifestCsv(plan)) {
                await api.addSubtasks(subtasks, task.id);
              }
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
                          if (!response.body) throw new Error('Writing failed');
                          await fs.writeFile(filePath, response.body as any, { encoding: file.encoding as any });
                          break;
                        }
                        case 'html':
                        case 'text': {
                          await fs.writeFile(filePath, file.content.value, { encoding: file.encoding as any });
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

            // Publish our output before children can complete and finalize the archive.
            if (hasManifestCsv(plan)) {
              await api.updateTask(task.id, {
                state: {
                  ...task.state,
                  expectedSubtasks: subtasks.length,
                  outputPaths: files.map(file => file.path),
                },
              });
              if (subtasks.length) {
                await api.addSubtasks(subtasks, task.id);
              }
            }

            // 3. Mark as done if there are no subtasks.
            if (subtasks.length === 0) {
              await api.updateTask(task.id, { status: 3, status_text: 'completed' });
            }
          }
        } catch (error) {
          // The generic worker treats HTTP 404 as handled. CSV failures must reach its failed-task listener.
          if (
            hasManifestCsv(request.exportPlan) &&
            typeof error === 'object' &&
            error !== null &&
            'status' in error &&
            error.status === 404
          ) {
            throw new Error(`CSV export resource not found: ${error instanceof Error ? error.message : String(error)}`);
          }
          throw error;
        } finally {
          siteApi.dispose();
        }

        return;
      }

      break;
    }

    case 'subtask_type_status.export-resource-task.-1':
    case 'subtask_type_status.export-resource-task.3': {
      // There MIGHT be things we need to do to aggregate these in the future.
      // For now the only supported aggregation is the zip + files.
      // Only thing we can do is mark the task as complete, so it falls into the next step.
      const task = await api.getTask<ExportResourceTask>(taskId, { all: true, detail: true });
      if (hasManifestCsv(task.parameters[0].exportPlan)) {
        await reconcileManifestCsvTask(taskId, api);
        return;
      }
      if (name === 'subtask_type_status.export-resource-task.-1') return;
      await api.updateTask(task.id, { status: 3, status_text: 'completed' });
      return;
    }

    case 'status.-1':
    case 'status.3': {
      const task = await api.getTask<ExportResourceTask>(taskId);
      const [request, { siteId, userId }] = task.parameters;
      // The task API emits own-status events for each child, but only emits its
      // aggregate subtask_type_status event when ALL siblings share one status.
      if (hasManifestCsv(request.exportPlan) && task.parent_task) {
        await reconcileManifestCsvTask(task.parent_task, api);
      }
      if (name === 'status.-1') return;
      if (siteId) {
        const userApi = api.asUser({ siteId, userId });
        try {
          if (request.output.type === 'zip') {
            const outputDir = join(STORAGE_API_PATH, `urn:madoc:site:${siteId}`, 'export', request.output.path);
            if (!existsSync(outputDir)) {
              await fs.mkdir(outputDir, { recursive: true });
            }
            const outputFile = join(outputDir, request.output.fileName);
            const tempDir = join(EXPORT_PATH, request.output.options.tempDir);
            if (hasManifestCsv(request.exportPlan)) {
              const published = await publishCsvArchive({
                outputFile,
                tempDir,
                folderPath: basename(request.output.fileName, '.zip'),
                didError: task.state.didError,
                failedResources: task.state.failedResources,
              });
              if (!published) return;
              if (published.empty) await api.updateTask(taskId, { state: { empty: true } });
              await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
              await userApi.notifications.createNotification({
                id: generateId(),
                title: 'Finished exporting',
                summary: task.subject,
                action: { id: 'task:admin', link: `urn:madoc:task:${taskId}` },
                user: userId,
              });
              return;
            }
            const zip = new AdmZip();
            const folderPath = basename(request.output.fileName, '.zip');
            if (task.state.didError) {
              zip.addFile(
                `${folderPath}/README-errors.txt`,
                Buffer.from(
                  `This is a partial export. Some resources failed; their data may be missing.\n\n${(task.state.failedResources || []).join('\n')}\n\nSee the failed subtasks for details. Start a fresh export to recover missing files.\n`,
                  'utf-8'
                )
              );
            }
            if (await directoryHasFiles(tempDir)) {
              zip.addLocalFolder(tempDir, folderPath);
            } else {
              await api.updateTask(task.id, {
                state: {
                  ...(task.state || {}),
                  empty: true,
                },
              });

              // Keep the zip readable in desktop unzip tools.
              zip.addFile(
                `${folderPath}/README.txt`,
                Buffer.from(
                  'No files were generated for this export.\n\nThe selected export options may not have matched any data for the selected resources.\n',
                  'utf-8'
                )
              );
            }

            await new Promise(resolve => zip.writeZip(outputFile, resolve));

            try {
              if (tempDir && existsSync(tempDir)) {
                await fs.rm(tempDir, { recursive: true, force: true });
              }
            } catch {
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
        } finally {
          userApi.dispose();
        }
      }

      break;
    }
  }
};
