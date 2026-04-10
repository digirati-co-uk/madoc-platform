import {
  type TabularCaptureModelField,
  type TabularCaptureModelFields,
  type TabularCaptureModelTemplate,
  type TabularColumn,
  type TabularColumnMeta,
  type TabularDropdownOption,
  type TabularFieldType,
  type TabularModelPayload,
  type TabularValidationIssue,
} from './types';
import { slugifyColumnId } from './utils';
import {
  TABULAR_CELL_FLAGS_PROPERTY,
  createTabularCellFlagsCaptureModelField,
} from '../../../../shared/utility/tabular-cell-flags';

export { slugifyColumnId };

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

export function stringifyTabularDropdownOptions(options?: TabularDropdownOption[]): string {
  return (options || []).map(option => `${option.value},${option.text || option.value}`).join('\n');
}

function getMetaValue<T>(values: (T | undefined)[] | undefined, index: number): T | undefined {
  return values?.[index];
}

function getTabularColumnType(column: Pick<TabularColumn, 'type' | 'fieldType'>): string {
  return (column.type || column.fieldType || '').trim();
}

export function buildTabularModelPayload(headings: string[], meta?: TabularColumnMeta): TabularModelPayload {
  const used = new Set<string>();

  const columns: TabularColumn[] = headings.map((raw, idx) => {
    const label = (raw ?? '').trim();
    const fieldType = getMetaValue(meta?.fieldTypes, idx);
    const helpText = getMetaValue(meta?.helpText, idx);
    const dropdownOptionsText = getMetaValue(meta?.dropdownOptionsText, idx);
    const saved = getMetaValue(meta?.saved, idx);

    if (!label) {
      return {
        id: '',
        label: '',
        type: fieldType,
        fieldType,
        helpText,
        dropdownOptionsText,
        saved,
      };
    }

    let id = slugifyColumnId(label);
    if (!id) id = `col-${idx + 1}`;

    if (used.has(id)) {
      let n = 2;
      while (used.has(`${id}-${n}`)) n++;
      id = `${id}-${n}`;
    }
    used.add(id);

    return {
      id,
      label,
      type: fieldType,
      fieldType,
      helpText,
      dropdownOptionsText,
      saved,
    };
  });

  const captureModelFields: TabularCaptureModelFields = {};

  for (const column of columns) {
    if (column.saved === false) {
      continue;
    }

    const term = (column.id || '').trim();
    const label = (column.label || '').trim();
    const type = getTabularColumnType(column);
    const description = (column.helpText || '').trim();

    if (!term || !label || !type) {
      continue;
    }

    const field: TabularCaptureModelField = {
      type,
      label,
    };

    if (description) {
      field.description = description;
    }
    if (type === 'dropdown-field') {
      field.options = parseTabularDropdownOptionsText(column.dropdownOptionsText);
    }

    captureModelFields[term] = field;
  }

  const rowCaptureModelFields = Object.entries(captureModelFields).reduce<TabularCaptureModelTemplate>(
    (acc, [term, field]) => {
      acc[`rows.${term}`] = field;
      return acc;
    },
    {}
  );

  const captureModelTemplate: TabularCaptureModelTemplate = {
    __nested__: {
      rows: {
        label: 'Tabular row',
        allowMultiple: true,
      },
    },
    ...rowCaptureModelFields,
    [TABULAR_CELL_FLAGS_PROPERTY]: createTabularCellFlagsCaptureModelField(),
  };

  return { columns, captureModelFields, captureModelTemplate };
}

export function validateTabularModel(
  headings: string[],
  opts?: {
    minColumns?: number;
    maxColumns?: number;
    maxHeadingLength?: number;
    saved?: (boolean | undefined)[];
    fieldTypes?: (TabularFieldType | undefined)[];
  }
): TabularValidationIssue[] {
  const minColumns = opts?.minColumns ?? 1;
  const maxColumns = opts?.maxColumns ?? 100;
  const maxHeadingLength = opts?.maxHeadingLength ?? 80;

  const issues: TabularValidationIssue[] = [];
  const trimmed = headings.map(h => (h ?? '').trim());

  if (trimmed.length < minColumns || trimmed.length > maxColumns) {
    issues.push({
      type: 'invalid-column-count',
      message: `Column count must be between ${minColumns} and ${maxColumns}.`,
    });
  }

  const seenHeading = new Map<string, number>();
  trimmed.forEach((h, i) => {
    if (!h) {
      issues.push({ type: 'empty-heading', message: 'Heading is required.', columnIndex: i });
      return;
    }

    if (h.length > maxHeadingLength) {
      issues.push({
        type: 'invalid-heading-length',
        message: `Heading is too long (max ${maxHeadingLength} characters).`,
        columnIndex: i,
      });
    }

    const key = h.toLowerCase();
    const prev = seenHeading.get(key);
    if (prev != null) {
      issues.push({ type: 'duplicate-heading', message: 'Duplicate heading.', columnIndex: i });
      issues.push({ type: 'duplicate-heading', message: 'Duplicate heading.', columnIndex: prev });
    } else {
      seenHeading.set(key, i);
    }
  });

  const payload = buildTabularModelPayload(trimmed, { fieldTypes: opts?.fieldTypes, saved: opts?.saved });
  const seenIds = new Set<string>();

  payload.columns.forEach((c, i) => {
    if (!trimmed[i]) return;

    const id = (c.id ?? '').trim();
    if (!id) {
      issues.push({ type: 'empty-column-id', message: 'Column id is empty.', columnIndex: i });
      return;
    }
    if (seenIds.has(id)) {
      issues.push({ type: 'duplicate-column-id', message: 'Duplicate column id.', columnIndex: i });
      return;
    }
    seenIds.add(id);

    const isSaved = Boolean(opts?.saved?.[i]);
    if (isSaved && !opts?.fieldTypes?.[i]) {
      issues.push({ type: 'missing-field-type', message: 'Select a field type before saving.', columnIndex: i });
    }
  });

  // de-dupe
  const uniq = new Map<string, TabularValidationIssue>();
  for (const issue of issues) {
    uniq.set(`${issue.type}|${issue.columnIndex ?? 'x'}|${issue.message}`, issue);
  }
  return Array.from(uniq.values());
}
