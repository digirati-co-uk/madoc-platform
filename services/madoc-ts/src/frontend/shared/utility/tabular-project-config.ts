export const TABULAR_DEFAULT_ROW_COUNT = 5;
export const TABULAR_MAX_ROW_COUNT = 200;

export const TABULAR_OVERLAY_DEFAULT_COLORS = {
  header: '#ff69b4',
  row: '#36b37e',
  cell: '#168c53',
} as const;

export type TabularOverlayColors = {
  header?: string;
  row?: string;
  cell?: string;
};

type TabularOverlayConfigInput = {
  tabularHeaderOverlayColor?: unknown;
  tabularActiveRowOverlayColor?: unknown;
  tabularActiveCellOverlayColor?: unknown;
};

export function parseTabularRowCount(value: unknown): number | undefined {
  const parsedValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number.parseInt(value.trim(), 10) : Number.NaN;

  if (!Number.isFinite(parsedValue)) {
    return undefined;
  }

  return Math.min(TABULAR_MAX_ROW_COUNT, Math.max(1, Math.floor(parsedValue)));
}

export function parseTabularRowCountOrDefault(value: unknown): number {
  return parseTabularRowCount(value) ?? TABULAR_DEFAULT_ROW_COUNT;
}

export function getOptionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

export function getTabularOverlayColors(config?: TabularOverlayConfigInput | null): TabularOverlayColors {
  return {
    header: getOptionalTrimmedString(config?.tabularHeaderOverlayColor),
    row: getOptionalTrimmedString(config?.tabularActiveRowOverlayColor),
    cell: getOptionalTrimmedString(config?.tabularActiveCellOverlayColor),
  };
}

export function resolveTabularZoomTrackingEnabled(options: {
  enableZoomTracking?: boolean;
  disableZoomTrackingOverlay?: boolean;
  defaultEnabled?: boolean;
}) {
  if (typeof options.enableZoomTracking === 'boolean') {
    return options.enableZoomTracking;
  }

  if (options.disableZoomTrackingOverlay) {
    return false;
  }

  return options.defaultEnabled !== false;
}
