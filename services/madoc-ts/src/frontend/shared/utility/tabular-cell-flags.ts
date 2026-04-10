export const TABULAR_CELL_FLAGS_PROPERTY = '__tabularCellFlags';

export type TabularCellReviewStatus = 'flag' | 'note';

export type TabularCellFlag = {
  rowIndex: number;
  columnKey: string;
  flaggedAt: string;
  status?: TabularCellReviewStatus;
  comment?: string;
};

export type TabularCellFlagMap = Record<string, TabularCellFlag>;

type TabularCellFlagsPayload = {
  version: 1;
  flags: TabularCellFlag[];
};

const LEGACY_FLAGGED_AT_FALLBACK = '1970-01-01T00:00:00.000Z';
const DEFAULT_TABULAR_CELL_REVIEW_STATUS: TabularCellReviewStatus = 'flag';
const TABULAR_CELL_FLAGS_CAPTURE_MODEL_FIELD = {
  type: 'text-field',
  label: 'Cell flags',
  description: 'Internal metadata for flagged tabular cells.',
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function toInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return Number(value);
  }

  return null;
}

function toTabularCellReviewStatus(value: unknown): TabularCellReviewStatus {
  if (value === 'note') {
    return 'note';
  }

  return DEFAULT_TABULAR_CELL_REVIEW_STATUS;
}

function fromLegacyKey(key: string): { rowIndex: number; columnKey: string } | null {
  const separatorIndex = key.indexOf(':');
  if (separatorIndex === -1) {
    return null;
  }

  const rowIndexValue = key.slice(0, separatorIndex);
  const columnKey = key.slice(separatorIndex + 1).trim();
  const rowIndex = toInteger(rowIndexValue);

  if (rowIndex === null || !columnKey) {
    return null;
  }

  return { rowIndex, columnKey };
}

function toFlag(value: unknown): TabularCellFlag | null {
  if (!isRecord(value)) {
    return null;
  }

  const rowIndex = toInteger(value.rowIndex);
  const columnKey = typeof value.columnKey === 'string' ? value.columnKey.trim() : '';
  if (rowIndex === null || !columnKey) {
    return null;
  }

  return {
    rowIndex,
    columnKey,
    flaggedAt:
      typeof value.flaggedAt === 'string' && value.flaggedAt.trim() ? value.flaggedAt : LEGACY_FLAGGED_AT_FALLBACK,
    status: toTabularCellReviewStatus(value.status),
    comment: typeof value.comment === 'string' && value.comment.trim() ? value.comment : undefined,
  };
}

function toPayloadCandidate(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

export function getTabularCellFlagKey(rowIndex: number, columnKey: string): string {
  return `${rowIndex}:${columnKey}`;
}

export function getTabularCellReviewStatus(flag: Pick<TabularCellFlag, 'status'> | undefined): TabularCellReviewStatus {
  return toTabularCellReviewStatus(flag?.status);
}

export function isTabularCellFlagged(flag: Pick<TabularCellFlag, 'status'> | undefined): boolean {
  if (!flag) {
    return false;
  }
  return getTabularCellReviewStatus(flag) === 'flag';
}

export function isTabularCellNote(flag: Pick<TabularCellFlag, 'status'> | undefined): boolean {
  if (!flag) {
    return false;
  }
  return getTabularCellReviewStatus(flag) === 'note';
}

export function createTabularCellFlagsCaptureModelField() {
  return { ...TABULAR_CELL_FLAGS_CAPTURE_MODEL_FIELD };
}

export function sortTabularCellFlags(flags: TabularCellFlagMap): TabularCellFlag[] {
  return Object.values(flags).sort((a, b) => {
    if (a.rowIndex !== b.rowIndex) {
      return a.rowIndex - b.rowIndex;
    }
    return a.columnKey.localeCompare(b.columnKey);
  });
}

export function areTabularCellFlagsEqual(left: TabularCellFlagMap, right: TabularCellFlagMap): boolean {
  const leftSorted = sortTabularCellFlags(left);
  const rightSorted = sortTabularCellFlags(right);

  if (leftSorted.length !== rightSorted.length) {
    return false;
  }

  for (let index = 0; index < leftSorted.length; index += 1) {
    const leftFlag = leftSorted[index];
    const rightFlag = rightSorted[index];

    if (
      leftFlag.rowIndex !== rightFlag.rowIndex ||
      leftFlag.columnKey !== rightFlag.columnKey ||
      leftFlag.flaggedAt !== rightFlag.flaggedAt ||
      getTabularCellReviewStatus(leftFlag) !== getTabularCellReviewStatus(rightFlag) ||
      leftFlag.comment !== rightFlag.comment
    ) {
      return false;
    }
  }

  return true;
}

export function parseTabularCellFlags(value: unknown): TabularCellFlagMap {
  const parsed = toPayloadCandidate(value);
  const map: TabularCellFlagMap = {};

  const addFlag = (flag: TabularCellFlag) => {
    map[getTabularCellFlagKey(flag.rowIndex, flag.columnKey)] = flag;
  };

  if (Array.isArray(parsed)) {
    for (const candidate of parsed) {
      const flag = toFlag(candidate);
      if (flag) {
        addFlag(flag);
      }
    }
    return map;
  }

  if (isRecord(parsed) && Array.isArray(parsed.flags)) {
    for (const candidate of parsed.flags) {
      const flag = toFlag(candidate);
      if (flag) {
        addFlag(flag);
      }
    }
    return map;
  }

  if (isRecord(parsed)) {
    for (const [key, candidate] of Object.entries(parsed)) {
      if (candidate !== true && candidate !== 1) {
        continue;
      }

      const parsedKey = fromLegacyKey(key);
      if (!parsedKey) {
        continue;
      }

      addFlag({
        rowIndex: parsedKey.rowIndex,
        columnKey: parsedKey.columnKey,
        flaggedAt: LEGACY_FLAGGED_AT_FALLBACK,
        status: DEFAULT_TABULAR_CELL_REVIEW_STATUS,
      });
    }
  }

  return map;
}

export function serializeTabularCellFlags(flags: TabularCellFlagMap): string {
  const payload: TabularCellFlagsPayload = {
    version: 1,
    flags: sortTabularCellFlags(flags),
  };

  return JSON.stringify(payload);
}

export function shiftTabularCellFlagsAfterRowRemoval(
  flags: TabularCellFlagMap,
  removedRowIndex: number
): TabularCellFlagMap {
  const next: TabularCellFlagMap = {};

  for (const flag of Object.values(flags)) {
    if (flag.rowIndex === removedRowIndex) {
      continue;
    }

    const shiftedRowIndex = flag.rowIndex > removedRowIndex ? flag.rowIndex - 1 : flag.rowIndex;
    const shifted = {
      ...flag,
      rowIndex: shiftedRowIndex,
    };

    next[getTabularCellFlagKey(shifted.rowIndex, shifted.columnKey)] = shifted;
  }

  return next;
}
