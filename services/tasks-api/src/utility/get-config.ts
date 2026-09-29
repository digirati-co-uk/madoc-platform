import fs from 'fs';
import path from 'path';
import { BaseQueueConfig } from '../types';

export const defaultQueueConfig = {
  dispatch: {
    assigned: [],
    created: [],
    modified: [],
    subtask_created: [],
    deleted: [],
  },
};

export function getConfig(baseName: string): BaseQueueConfig {
  try {
    const file = fs.readFileSync(path.join(baseName, 'config.json'));
    return JSON.parse(file.toString());
  } catch (e) {
    return defaultQueueConfig;
  }
}
