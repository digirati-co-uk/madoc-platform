export function parseLimit(limit: string | null, defaultLimit = '5mb'): string {
  if (!limit) {
    return defaultLimit;
  }
  const sizeLimitMb = Number(limit);
  return !sizeLimitMb || Number.isNaN(sizeLimitMb) || !Number.isFinite(sizeLimitMb) ? defaultLimit : `${sizeLimitMb}mb`;
}
