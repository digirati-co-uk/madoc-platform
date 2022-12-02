// export-resource-task

import { ExportFileDefinition } from './types';

export function createServerExportTasks() {
  // 1. What do we need to traverse
  // 2. Create root task
  //     - Which contains
  // 2. Create sub-task for project
  // 3. Create sub-task for each Manifest
  // 4.
}

function text(value: string, path: string, metadata?: any): ExportFileDefinition {
  return {
    content: {
      type: 'text',
      value,
    },
    text: true,
    metadata,
    path,
  };
}

function json(value: any, path: string, pretty = false, metadata?: any): ExportFileDefinition {
  return {
    content: {
      type: 'text',
      value: JSON.stringify(value, null, pretty ? 2 : undefined),
    },
    text: true,
    metadata,
    path,
  };
}

export const ExportFile = {
  text,
  json,
};
