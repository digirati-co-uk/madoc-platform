import type { NetConfig } from '@/frontend/shared/utility/tabular-types';
import { TABULAR_CELL_FLAGS_PROPERTY } from '@/frontend/shared/utility/tabular-cell-flags';
import { netConfigFromSharedStructure as netConfigFromSharedStructureShared } from '../../../frontend/shared/utility/tabular-net-config';
import type { TabularProjectTemplateOptions } from '../templates/tabular-project';

export type TabularModelColumn = {
  id?: string;
  label?: string;
  helpText?: string;
  description?: string;
  type?: string;
  fieldType?: string;
  dropdownOptionsText?: string;
  saved?: boolean;
};

export type TabularDropdownOption = {
  value: string;
  text: string;
  label?: string;
};

export type TabularTemplateConfig = Pick<
  TabularProjectTemplateOptions,
  'enableZoomTracking' | 'crowdsourcingInstructions' | 'tabular'
>;
export type TabularStructureConfig = NonNullable<NonNullable<TabularProjectTemplateOptions['tabular']>['structure']>;

export type TabularColumnModel = {
  order: string[];
  hidden: Set<string>;
  labels: Map<string, string>;
  descriptions: Map<string, string>;
  hints: Map<string, string>;
  fieldOptions: Map<string, TabularDropdownOption[]>;
};

export const CONTRIBUTOR_EDITOR_SPLIT_HEIGHT = '100vh';
export const CONTRIBUTOR_EDITOR_CANVAS_SPLIT = '33%';
export const CONTRIBUTOR_EDITOR_TABLE_SPLIT = '67%';

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

export function parseTabularDropdownOptionsText(optionsText?: string): TabularDropdownOption[] {
  if (!optionsText?.trim()) {
    return [];
  }

  return optionsText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [rawValue, rawText, rawLabel] = line.split(',');
      const value = (rawValue ?? '').trim();
      const text = (rawText ?? '').trim() || value;
      const resolvedValue = value || text;
      if (!resolvedValue) {
        return null;
      }

      const label = (rawLabel ?? '').trim() || undefined;
      return {
        value: resolvedValue,
        text: text || resolvedValue,
        ...(label ? { label } : {}),
      };
    })
    .filter((option): option is TabularDropdownOption => option !== null);
}

export function normalizeTabularDropdownOptions(
  options?: Array<{ value?: string; text?: string; label?: string }>
): TabularDropdownOption[] {
  return (options || [])
    .map(option => {
      const value = (option?.value ?? '').trim();
      const text = (option?.text ?? '').trim() || value;
      const resolvedValue = value || text;
      if (!resolvedValue) {
        return null;
      }

      const label = (option?.label ?? '').trim() || undefined;
      return {
        value: resolvedValue,
        text: text || resolvedValue,
        ...(label ? { label } : {}),
      };
    })
    .filter((option): option is TabularDropdownOption => option !== null);
}

export function createTabularColumnModel(tabularColumns: TabularModelColumn[]): TabularColumnModel {
  const order: string[] = [];
  const hidden = new Set<string>();
  const labels = new Map<string, string>();
  const descriptions = new Map<string, string>();
  const hints = new Map<string, string>();
  const fieldOptions = new Map<string, TabularDropdownOption[]>();

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
    if (column.helpText?.trim()) {
      descriptions.set(id, column.helpText.trim());
    } else if (column.description?.trim()) {
      descriptions.set(id, column.description.trim());
    }
    if (type) {
      hints.set(id, type);
      if (type === 'dropdown-field') {
        const options = parseTabularDropdownOptionsText(column.dropdownOptionsText);
        if (options.length) {
          fieldOptions.set(id, options);
        }
      }
    }
  }

  return { order, hidden, labels, descriptions, hints, fieldOptions };
}

export function getTabularCellElementId(rowIndex: number, columnKey: string, useLegacyTopLevelLayout: boolean) {
  const encodedColumnKey = encodeURIComponent(columnKey);
  return useLegacyTopLevelLayout
    ? `tabular-legacy-cell-${rowIndex}-${encodedColumnKey}`
    : `tabular-row-cell-${rowIndex}-${encodedColumnKey}`;
}
