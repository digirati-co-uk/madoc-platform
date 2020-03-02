import { setupTypeGen } from '@slonik/typegen';
import { knownTypes } from './generated/db';
import path from 'path';

export const { sql, poolConfig } = setupTypeGen({
  knownTypes,
  writeTypes: process.env.NODE_ENV !== 'production' && path.join(__dirname, 'generated/db'),
});
