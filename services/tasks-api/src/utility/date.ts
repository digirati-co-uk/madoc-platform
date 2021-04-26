import { sql } from 'slonik';

export function date(dateLike: Date) {
  return sql`${dateLike
    .toISOString()
    .replace('T', ' ')
    .replace('Z', '')}::date`;
}
