import { parseTabularCellFlags, sortTabularCellFlags, type TabularCellFlagMap } from './tabular-cell-flags';

type PersonalNotePayloadV1 = {
  version: 1;
  note: string;
  tabularCellFlags?: unknown;
};

export type ParsedPersonalNotePayload = {
  note: string;
  tabularCellFlags: TabularCellFlagMap;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function parsePayload(raw: string): PersonalNotePayloadV1 | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!isRecord(parsed) || parsed.version !== 1) {
      return null;
    }

    return {
      version: 1,
      note: typeof parsed.note === 'string' ? parsed.note : '',
      tabularCellFlags: parsed.tabularCellFlags,
    };
  } catch {
    return null;
  }
}

export function parsePersonalNotePayload(raw: string | undefined | null): ParsedPersonalNotePayload {
  const source = typeof raw === 'string' ? raw : '';
  const payload = parsePayload(source);

  if (!payload) {
    return {
      note: source,
      tabularCellFlags: {},
    };
  }

  return {
    note: payload.note,
    tabularCellFlags: parseTabularCellFlags(payload.tabularCellFlags),
  };
}

export function serializePersonalNotePayload(options: { note: string; tabularCellFlags: TabularCellFlagMap }): string {
  const note = options.note || '';
  const flags = options.tabularCellFlags || {};
  const hasFlags = Object.keys(flags).length > 0;

  if (!hasFlags) {
    return note;
  }

  return JSON.stringify({
    version: 1,
    note,
    tabularCellFlags: sortTabularCellFlags(flags),
  });
}
