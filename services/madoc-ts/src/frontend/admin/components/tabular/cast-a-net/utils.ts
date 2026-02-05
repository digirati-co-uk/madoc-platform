export type PxRect = { left: number; top: number; width: number; height: number };

export const NET_MIN_SIZE_PCT = 1;
export const NET_OVERLAY_MIN_SIZE_PCT = 5;
export const NET_LINE_MIN_GAP_PCT = 2;
export const NET_MAX_DIM_OPACITY = 0.85;
export const NET_DIM_STEP = 0.05;

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export const clampDimOpacity = (v: number) => clamp(v, 0, NET_MAX_DIM_OPACITY);
export const dimOpacityToPercent = (v: number) => Math.round((clampDimOpacity(v) / NET_MAX_DIM_OPACITY) * 100);

export const makeEvenPositions = (count: number): number[] => {
  if (count <= 1) return [];
  const step = 100 / count;
  return Array.from({ length: count - 1 }, (_, i) => step * (i + 1));
};

export const sanitizeIndexList = (indexes: number[] | undefined, maxExclusive: number): number[] => {
  if (!indexes?.length || maxExclusive <= 0) return [];
  const uniq = new Set<number>();
  for (const index of indexes) {
    const n = Math.floor(index);
    if (n >= 0 && n < maxExclusive) {
      uniq.add(n);
    }
  }
  return Array.from(uniq.values()).sort((a, b) => a - b);
};

export const normalisePositions = (positions: number[], count: number) => {
  const targetLen = Math.max(0, count - 1);
  const sorted = [...positions].sort((a, b) => a - b).slice(0, targetLen);
  return sorted.map(p => clamp(p, 0, 100));
};

export const getStops = (count: number, positions: number[]) => {
  const expectedLen = Math.max(0, count - 1);
  const inner = [...positions]
    .slice(0, expectedLen)
    .sort((a, b) => a - b)
    .map(p => clamp(p, 0, 100));
  return [0, ...inner, 100];
};

export function slugifyColumnId(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}
