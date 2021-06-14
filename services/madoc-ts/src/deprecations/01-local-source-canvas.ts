/**
 * Local source canvas
 *
 * Previously in the Madoc database we would not store all of the information required to
 * reconstruct a canvas or manifest. The missing properties are the annotations and thumbnails.
 *
 * These properties can be derived by loading the `local_source` in the database and extracting
 * out the data. However when reconstructing a full manifest this would result in potentially
 * hundreds of files being loaded from the disk for a single request.
 *
 * To fix this, the annotation and thumbnail fields will be converted to presentation 3 and
 * stored in the database as JSON. In the future they may be broken down further to manage
 * more at a more granular leve.
 *
 * This deprecation will progressively enhance existing database entries that contain only
 * a `local_source` and not the new `thumbnail_json` and `items_json` fields. The next time
 * the local source is requested from disk, it will be loaded from disk, upgraded to
 * Presentation 3 and the database will be updated.
 *
 * New canvases imported will have the new fields and will bypass this step.
 */
import { convertPresentation2 } from '@hyperion-framework/presentation-2-parser';
import { Canvas } from '@hyperion-framework/types';
import { Vault } from '@hyperion-framework/vault';
import { existsSync, readFileSync } from 'fs';
import { DatabasePoolConnectionType, DatabasePoolType, sql } from 'slonik';

export async function deprecationLocalSourceCanvas({
  row,
  connection,
}: {
  row: {
    id: number;
    local_source: string | null;
    thumbnail_json: any | null;
    items_json: any | null;
  };
  connection: DatabasePoolConnectionType;
}) {
  if (!row.local_source) {
    return undefined;
  }

  return undefined;
}

/**
 * Get items json.
 *
 * This can be replaced with `row.items_json`. However this would be a breaking change without the migration.
 *
 * @deprecated
 */
export async function deprecationGetItemsJson({
  row,
  connection,
}: {
  row: {
    id: number;
    height: number | null;
    width: number | null;
    local_source: string | null;
    thumbnail_json: any | null;
    items_json: any | null;
  };
  connection: DatabasePoolConnectionType;
}) {
  if (row.items_json) {
    return {
      height: row.height,
      width: row.width,
      items: row.items_json,
    };
  }

  // No source, nothing we can do.
  if (!row.local_source) {
    return {
      height: row.height,
      width: row.width,
      items: [],
    };
  }

  if (!existsSync(row.local_source)) {
    // @todo Should we update the database here?
    return {
      height: row.height,
      width: row.width,
      items: [],
    };
  }

  let localSource = JSON.parse(readFileSync(row.local_source).toString('utf-8'));

  if (localSource['@type'] && localSource['@type'] === 'sc:Canvas') {
    // We need to upgrade.
    const loaded = convertPresentation2({
      '@context': 'http://iiif.io/api/presentation/2/context.json',
      '@id': 'https://dummy-manifest/',
      '@type': 'sc:Manifest',
      sequences: [
        {
          '@id': 'https://dummy-manifest/s0',
          '@type': 'sc:Sequence',
          canvases: [localSource],
        },
      ],
    });

    localSource = loaded.items[0] as any;
  }

  await connection.query(
    sql`update iiif_resource
        set width = ${localSource.width || 0},
            height = ${localSource.height || 0},
            duration = ${localSource.duration || null},
            items_json = ${localSource.items ? sql.json(localSource.items) : null},
            thumbnail_json = ${localSource.thumbnail ? sql.json(localSource.thumbnail) : null}
        where id = ${row.id}`
  );

  return {
    height: localSource.height,
    width: localSource.width,
    items: localSource.items,
  };
}
