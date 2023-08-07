import { DatabasePoolConnectionType, sql } from 'slonik';
import invariant from 'tiny-invariant';
export interface UpdateResourceDetailsRequest {
  default_thumbnail?: string;
  duration?: number;
  height?: number;
  navDate?: string;
  rights?: string;
  viewingDirection?: string;
  width?: number;
}

export function updateResourceDetailsQuery(
  connection: DatabasePoolConnectionType,
  manifestId: number,
  request: UpdateResourceDetailsRequest
) {
  const setStatements = [];
  if (request.default_thumbnail) {
    setStatements.push(sql`default_thumbnail = ${request.default_thumbnail}`);
  }
  if (request.duration) {
    setStatements.push(sql`duration = ${request.duration}`);
  }
  if (request.height) {
    setStatements.push(sql`height = ${request.height}`);
  }
  if (request.navDate) {
    setStatements.push(sql`navDate = ${request.navDate}`);
  }
  if (request.rights) {
    setStatements.push(sql`rights = ${request.rights}`);
  }
  if (request.viewingDirection) {
    setStatements.push(sql`viewingDirection = ${request.viewingDirection}`);
  }
  if (request.width) {
    setStatements.push(sql`width = ${request.width}`);
  }

  invariant(setStatements.length !== 0, 'No update statements');

  return connection.query(sql`
    UPDATE iiif_resource
    SET ${sql.join(setStatements, sql`, `)}
    WHERE id = ${manifestId}
  `);
}
