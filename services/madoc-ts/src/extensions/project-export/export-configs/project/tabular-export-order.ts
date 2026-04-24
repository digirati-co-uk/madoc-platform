import { TABULAR_CELL_FLAGS_PROPERTY } from '../../../../frontend/shared/utility/tabular-cell-flags';

type TabularTemplateColumn = {
  id?: string;
  saved?: boolean;
  type?: string;
  fieldType?: string;
};

type TabularTemplateConfigLike = {
  tabular?: {
    model?: {
      columns?: TabularTemplateColumn[];
    };
  };
};

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasTabularCellFlagsProperty(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasTabularCellFlagsProperty);
  }

  if (!isObjectLike(value)) {
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(value, TABULAR_CELL_FLAGS_PROPERTY)) {
    return true;
  }

  return Object.values(value).some(hasTabularCellFlagsProperty);
}

function isHiddenFieldType(type?: string) {
  const normalizedType = (type || '').trim();
  return normalizedType === 'hidden' || normalizedType === 'hidden-field';
}

export function getTabularFieldOrderMap(templateConfig: unknown): Map<string, number> {
  if (!isObjectLike(templateConfig)) {
    return new Map<string, number>();
  }

  const tabularColumns = (templateConfig as TabularTemplateConfigLike).tabular?.model?.columns;
  if (!Array.isArray(tabularColumns)) {
    return new Map<string, number>();
  }

  const orderedFieldKeys: string[] = [];
  const seen = new Set<string>();

  for (const column of tabularColumns) {
    const fieldKey = typeof column?.id === 'string' ? column.id.trim() : '';
    if (!fieldKey || seen.has(fieldKey)) {
      continue;
    }

    const fieldType = typeof column?.type === 'string' ? column.type : column?.fieldType;
    if (column?.saved === false || isHiddenFieldType(fieldType)) {
      continue;
    }

    seen.add(fieldKey);
    orderedFieldKeys.push(fieldKey);
  }

  return new Map(orderedFieldKeys.map((fieldKey, index) => [fieldKey, index]));
}

export function compareFieldKeysByTabularOrder(
  leftFieldKey: unknown,
  rightFieldKey: unknown,
  fieldOrderMap: Map<string, number>
) {
  const leftKey = typeof leftFieldKey === 'string' ? leftFieldKey : '';
  const rightKey = typeof rightFieldKey === 'string' ? rightFieldKey : '';

  const leftOrder = fieldOrderMap.get(leftKey);
  const rightOrder = fieldOrderMap.get(rightKey);

  if (leftOrder !== undefined && rightOrder !== undefined) {
    return leftOrder - rightOrder;
  }

  if (leftOrder !== undefined) {
    return -1;
  }

  if (rightOrder !== undefined) {
    return 1;
  }

  if (leftKey === TABULAR_CELL_FLAGS_PROPERTY && rightKey !== TABULAR_CELL_FLAGS_PROPERTY) {
    return 1;
  }

  if (rightKey === TABULAR_CELL_FLAGS_PROPERTY && leftKey !== TABULAR_CELL_FLAGS_PROPERTY) {
    return -1;
  }

  return leftKey.localeCompare(rightKey);
}
