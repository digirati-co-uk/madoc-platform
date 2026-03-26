import { TabularProjectTemplateConfig } from '../../types/tabular-project-template-config';
import { RequestError } from '../../utility/errors/request-error';

type ValidateTabularTemplateConfigOptions = {
  requireModel: boolean;
};

const DEFAULT_OPTIONS: ValidateTabularTemplateConfigOptions = {
  requireModel: true,
};

const TEMPLATE_CONFIG_PATH = 'template_config';
const TABULAR_PATH = `${TEMPLATE_CONFIG_PATH}.tabular`;
const STRUCTURE_PATH = `${TABULAR_PATH}.structure`;
const MODEL_PATH = `${TABULAR_PATH}.model`;

const PERCENT_RANGE = { min: 0, max: 100 };
const OFFSET_RANGE = { min: -100, max: 100 };

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function assertRecord(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    throw new RequestError(`${path} must be an object`);
  }
}

function assertFiniteNumber(value: unknown, path: string, options: { min?: number; max?: number } = {}): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RequestError(`${path} must be a finite number`);
  }

  if (typeof options.min !== 'undefined' && value < options.min) {
    throw new RequestError(`${path} must be >= ${options.min}`);
  }

  if (typeof options.max !== 'undefined' && value > options.max) {
    throw new RequestError(`${path} must be <= ${options.max}`);
  }

  return value;
}

function assertInteger(value: unknown, path: string, options: { min?: number; max?: number } = {}): number {
  const number = assertFiniteNumber(value, path, options);
  if (!Number.isInteger(number)) {
    throw new RequestError(`${path} must be an integer`);
  }
  return number;
}

function assertNumberArray(
  value: unknown,
  path: string,
  options: { minItems?: number; minValue?: number; maxValue?: number } = {}
): number[] {
  if (!Array.isArray(value)) {
    throw new RequestError(`${path} must be an array`);
  }

  if (typeof options.minItems !== 'undefined' && value.length < options.minItems) {
    throw new RequestError(`${path} must contain at least ${options.minItems} item(s)`);
  }

  return value.map((entry, index) =>
    assertFiniteNumber(entry, `${path}[${index}]`, { min: options.minValue, max: options.maxValue })
  );
}

function assertPoint(value: unknown, path: string) {
  assertRecord(value, path);
  const x = assertFiniteNumber(value.x, `${path}.x`, PERCENT_RANGE);
  const y = assertFiniteNumber(value.y, `${path}.y`, PERCENT_RANGE);
  return { x, y };
}

function assertMargins(value: unknown, path: string) {
  assertRecord(value, path);
  return {
    top: assertFiniteNumber(value.top, `${path}.top`, PERCENT_RANGE),
    right: assertFiniteNumber(value.right, `${path}.right`, PERCENT_RANGE),
    bottom: assertFiniteNumber(value.bottom, `${path}.bottom`, PERCENT_RANGE),
    left: assertFiniteNumber(value.left, `${path}.left`, PERCENT_RANGE),
  };
}

function assertBlankColumnIndexes(value: unknown, path: string, columnCount: number) {
  if (typeof value === 'undefined') {
    return;
  }

  if (!Array.isArray(value)) {
    throw new RequestError(`${path} must be an array`);
  }

  for (let index = 0; index < value.length; index += 1) {
    assertInteger(value[index], `${path}[${index}]`, { min: 0, max: columnCount - 1 });
  }
}

function assertRowOffsetAdjustments(value: unknown, path: string) {
  if (typeof value === 'undefined') {
    return;
  }

  if (!Array.isArray(value)) {
    throw new RequestError(`${path} must be an array`);
  }

  for (let index = 0; index < value.length; index += 1) {
    const entryPath = `${path}[${index}]`;
    const entry = value[index];
    assertRecord(entry, entryPath);
    assertInteger(entry.startRow, `${entryPath}.startRow`, { min: 0 });
    assertFiniteNumber(entry.offsetPctOfPage, `${entryPath}.offsetPctOfPage`, OFFSET_RANGE);
  }
}

export function assertValidTabularProjectTemplateConfig(
  templateConfig: unknown,
  options: Partial<ValidateTabularTemplateConfigOptions> = {}
): asserts templateConfig is TabularProjectTemplateConfig {
  const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
  assertRecord(templateConfig, TEMPLATE_CONFIG_PATH);

  const { tabular } = templateConfig;
  assertRecord(tabular, TABULAR_PATH);

  const { structure, model } = tabular;
  assertRecord(structure, STRUCTURE_PATH);

  const topLeft = assertPoint(structure.topLeft, `${STRUCTURE_PATH}.topLeft`);
  const topRight = assertPoint(structure.topRight, `${STRUCTURE_PATH}.topRight`);
  if (topRight.x <= topLeft.x) {
    throw new RequestError(`${STRUCTURE_PATH}.topRight.x must be greater than topLeft.x`);
  }

  const margins = assertMargins(structure.marginsPct, `${STRUCTURE_PATH}.marginsPct`);
  if (margins.left + margins.right >= 100) {
    throw new RequestError(`${STRUCTURE_PATH}.marginsPct left + right must be less than 100`);
  }
  if (margins.top + margins.bottom >= 100) {
    throw new RequestError(`${STRUCTURE_PATH}.marginsPct top + bottom must be less than 100`);
  }

  const columnCount = assertInteger(structure.columnCount, `${STRUCTURE_PATH}.columnCount`, { min: 1 });
  const columnWidths = assertNumberArray(structure.columnWidthsPctOfPage, `${STRUCTURE_PATH}.columnWidthsPctOfPage`, {
    minItems: 1,
    minValue: PERCENT_RANGE.min,
    maxValue: PERCENT_RANGE.max,
  });
  if (columnWidths.length !== columnCount) {
    throw new RequestError(
      `${STRUCTURE_PATH}.columnCount must match ${STRUCTURE_PATH}.columnWidthsPctOfPage length`
    );
  }

  assertNumberArray(structure.rowHeightsPctOfPage, `${STRUCTURE_PATH}.rowHeightsPctOfPage`, {
    minItems: 1,
    minValue: PERCENT_RANGE.min,
    maxValue: PERCENT_RANGE.max,
  });
  assertRowOffsetAdjustments(structure.rowOffsetAdjustments, `${STRUCTURE_PATH}.rowOffsetAdjustments`);
  assertBlankColumnIndexes(structure.blankColumnIndexes, `${STRUCTURE_PATH}.blankColumnIndexes`, columnCount);

  if (!resolvedOptions.requireModel) {
    if (model && Array.isArray(model.columns) && model.columns.length > 0 && model.columns.length !== columnCount) {
      throw new RequestError(
        `${MODEL_PATH}.columns length must match ${STRUCTURE_PATH}.columnCount when model columns are provided`
      );
    }

    return;
  }

  assertRecord(model, MODEL_PATH);
  if (!Array.isArray(model.columns)) {
    throw new RequestError(`${MODEL_PATH}.columns must be an array`);
  }
  if (model.columns.length !== columnCount) {
    throw new RequestError(
      `${MODEL_PATH}.columns length must match ${STRUCTURE_PATH}.columnCount`
    );
  }
}
