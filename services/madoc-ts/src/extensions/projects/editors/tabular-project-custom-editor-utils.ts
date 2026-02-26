import type { NetConfig } from '@/frontend/shared/utility/tabular-types';
import { TABULAR_CELL_FLAGS_PROPERTY } from '../../../frontend/shared/utility/tabular-cell-flags';
import { netConfigFromSharedStructure as netConfigFromSharedStructureShared } from '../../../frontend/shared/utility/tabular-net-config';
import type { TabularProjectTemplateOptions } from '../templates/tabular-project';

export type TabularModelColumn = {
  id?: string;
  label?: string;
  type?: string;
  fieldType?: string;
  saved?: boolean;
};

export type TabularTemplateConfig = Pick<TabularProjectTemplateOptions, 'enableZoomTracking' | 'tabular'>;
export type TabularStructureConfig = NonNullable<NonNullable<TabularProjectTemplateOptions['tabular']>['structure']>;

export type TabularColumnModel = {
  order: string[];
  hidden: Set<string>;
  labels: Map<string, string>;
  hints: Map<string, string>;
};

export const CONTRIBUTOR_EDITOR_VIEWPORT_OFFSET_PX = 240;
export const CONTRIBUTOR_EDITOR_SPLIT_HEIGHT = `calc(100vh - ${CONTRIBUTOR_EDITOR_VIEWPORT_OFFSET_PX}px)`;
export const CONTRIBUTOR_EDITOR_CANVAS_SPLIT = '58%';
export const CONTRIBUTOR_EDITOR_TABLE_SPLIT = '42%';

export function getBlockedReason(options: {
  hasExpired: boolean;
  canContribute: boolean;
  canUserSubmit: boolean;
  preventFurtherSubmission: boolean;
  markedAsUnusable: boolean;
}) {
  if (options.hasExpired) {
    return 'This contribution has expired and cannot be edited.';
  }

  if (options.markedAsUnusable) {
    return 'This resource has been marked as unusable.';
  }

  if (options.preventFurtherSubmission) {
    return 'Further submission is disabled for this task.';
  }

  if (!options.canContribute || !options.canUserSubmit) {
    return 'Contribution is currently unavailable for this task.';
  }

  return 'Contribution is currently blocked.';
}

export function netConfigFromSharedStructure(tabular?: TabularStructureConfig): NetConfig | null {
  return netConfigFromSharedStructureShared(tabular);
}

export function isHiddenFieldType(type?: string) {
  return type === 'hidden' || type === 'hidden-field';
}

export function isTabularSystemProperty(property: string) {
  return property === TABULAR_CELL_FLAGS_PROPERTY;
}

export function createTabularColumnModel(tabularColumns: TabularModelColumn[]): TabularColumnModel {
  const order: string[] = [];
  const hidden = new Set<string>();
  const labels = new Map<string, string>();
  const hints = new Map<string, string>();

  for (const column of tabularColumns) {
    const id = (column.id || '').trim();
    if (!id) {
      continue;
    }

    const type = (column.type || column.fieldType || '').trim();
    if (column.saved === false || isHiddenFieldType(type)) {
      hidden.add(id);
      continue;
    }

    order.push(id);
    if (column.label?.trim()) {
      labels.set(id, column.label.trim());
    }
    if (type) {
      hints.set(id, type);
    }
  }

  return { order, hidden, labels, hints };
}

export function getTabularCellElementId(rowIndex: number, columnKey: string, useLegacyTopLevelLayout: boolean) {
  const encodedColumnKey = encodeURIComponent(columnKey);
  return useLegacyTopLevelLayout
    ? `tabular-legacy-cell-${rowIndex}-${encodedColumnKey}`
    : `tabular-row-cell-${rowIndex}-${encodedColumnKey}`;
}
