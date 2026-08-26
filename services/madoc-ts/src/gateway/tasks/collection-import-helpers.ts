export interface ManifestImportSubtask {
  id: string;
  type: string;
  subject: string;
  status: number;
  state?: { resourceId?: unknown };
}

interface ManifestImportChanges {
  manifestIdsToCreate: string[];
  taskIdsToRetry: string[];
}

export interface ManifestImportResult {
  resourceIds: number[];
  skippedManifestIds: string[];
}

const MANIFEST_IMPORT_TYPE = 'madoc-manifest-import';
const DONE = 3;

export function getManifestImportChanges(
  subtasks: ManifestImportSubtask[],
  manifestIds: string[],
  retryFailed = true
): ManifestImportChanges {
  const subtaskMap = new Map<string, ManifestImportSubtask>();
  for (const subtask of subtasks) {
    if (subtask.type === MANIFEST_IMPORT_TYPE && (!subtaskMap.has(subtask.subject) || subtask.status === DONE)) {
      subtaskMap.set(subtask.subject, subtask);
    }
  }

  const manifestIdsToCreate: string[] = [];
  const taskIdsToRetry: string[] = [];
  for (const manifestId of new Set(manifestIds)) {
    const existingManifestTask = subtaskMap.get(manifestId);
    if (existingManifestTask) {
      if (retryFailed && existingManifestTask.status === -1) {
        taskIdsToRetry.push(existingManifestTask.id);
      }
      continue;
    }
    manifestIdsToCreate.push(manifestId);
  }

  return { manifestIdsToCreate, taskIdsToRetry };
}

export function getManifestImportResult(
  subtasks: ManifestImportSubtask[],
  manifestIds: string[],
  skipFailed = false
): ManifestImportResult | undefined {
  const subtaskMap = new Map<string, ManifestImportSubtask>();
  for (const subtask of subtasks) {
    const existing = subtaskMap.get(subtask.subject);
    if (subtask.type === MANIFEST_IMPORT_TYPE && (!existing || (existing.status !== DONE && subtask.status === DONE))) {
      subtaskMap.set(subtask.subject, subtask);
    }
  }

  const resourceIds: number[] = [];
  const skippedManifestIds: string[] = [];
  for (const manifestId of manifestIds) {
    const subtask = subtaskMap.get(manifestId);
    if (subtask?.status === DONE && typeof subtask.state?.resourceId === 'number') {
      resourceIds.push(subtask.state.resourceId);
      continue;
    }
    if (skipFailed && subtask?.status === -1) {
      skippedManifestIds.push(manifestId);
      continue;
    }
    return undefined;
  }

  return { resourceIds, skippedManifestIds };
}
