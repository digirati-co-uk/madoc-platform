import { getTabularFieldOrderMap } from '../extensions/project-export/export-configs/project/tabular-export-order';
import { getTabularCellBounds } from '../frontend/admin/components/tabular/cast-a-net/tabular-cell-bounds';
import { filterDocumentByRevision } from '../frontend/shared/capture-models/helpers/filter-document-by-revision';
import { isEntity } from '../frontend/shared/capture-models/helpers/is-entity';
import type { CaptureModel } from '../frontend/shared/capture-models/types/capture-model';
import type { BaseField } from '../frontend/shared/capture-models/types/field-types';
import type { BaseSelector } from '../frontend/shared/capture-models/types/selector-types';
import { isTabularAlignmentSnapshot } from '../frontend/shared/utility/tabular-alignment-snapshot';

/** Only infer rectangles when the project columns and the contribution's saved net agree. */
export function getTabularAnnotationSelectors(
  model: CaptureModel,
  project: { template_name: string | null; template_config: unknown } | undefined,
  canvas: { width: number | null; height: number | null }
): Map<string, BaseSelector> {
  const selectors = new Map<string, BaseSelector>();
  if (project?.template_name !== 'tabular-project' || !canvas.width || !canvas.height) return selectors;
  const dimensions = { width: canvas.width, height: canvas.height };
  const columns = getTabularFieldOrderMap(project.template_config);
  if (!columns.size) return selectors;

  function unrevised(items: Array<BaseField | CaptureModel['document']>) {
    const replaced = new Set(items.map(item => item.revises).filter(Boolean));
    return items.filter(item => !replaced.has(item.id));
  }

  for (const revision of model.revisions || []) {
    const snapshot = revision.tabularAlignment;
    if (!isTabularAlignmentSnapshot(snapshot) || snapshot.net.cols !== columns.size) continue;
    const document = filterDocumentByRevision(model.document, revision, model.revisions);
    if (!document) continue;

    const addCell = (field: BaseField, row: number, col: number) => {
      // A merged document can contain contributions with different alignments.
      if (field.revision !== revision.id || field.type === 'hidden' || field.type === 'hidden-field') return;
      const bounds = getTabularCellBounds(snapshot.net, { row: row + 1, col }, dimensions);
      if (!bounds) return;
      const x = Math.max(0, Math.floor(bounds.x));
      const y = Math.max(0, Math.floor(bounds.y));
      const right = Math.min(dimensions.width, Math.ceil(bounds.x + bounds.width));
      const bottom = Math.min(dimensions.height, Math.ceil(bounds.y + bounds.height));
      if (right <= x || bottom <= y) return;
      selectors.set(field.id, {
        id: `${field.id}-tabular-cell`,
        type: 'box-selector',
        state: { x, y, width: right - x, height: bottom - y },
      });
    };

    const rows: Array<BaseField | CaptureModel['document']> | undefined = document.properties.rows;
    if (rows?.some(isEntity)) {
      unrevised(rows)
        .filter(isEntity)
        .forEach((row, rowIndex) => {
          for (const [key, col] of columns) {
            for (const field of unrevised(row.properties[key] || [])) {
              if (!isEntity(field)) addCell(field, rowIndex, col);
            }
          }
        });
    } else {
      // Older tabular models store each column as a top-level list of cell fields.
      for (const [key, col] of columns) {
        unrevised(document.properties[key] || []).forEach((field, row) => {
          if (!isEntity(field)) addCell(field, row, col);
        });
      }
    }
  }
  return selectors;
}
