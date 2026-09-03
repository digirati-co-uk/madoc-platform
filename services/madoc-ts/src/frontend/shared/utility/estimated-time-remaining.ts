export function estimateRemainingSeconds(
  startedAt: string | number | undefined,
  completed: number,
  remaining: number,
  now = Date.now()
) {
  if (!startedAt || completed <= 0 || remaining <= 0) {
    return null;
  }

  const started = new Date(startedAt).getTime();
  if (!Number.isFinite(started) || started >= now) {
    return null;
  }

  return ((now - started) / 1000 / completed) * remaining;
}

export function formatEta(seconds: number) {
  if (seconds <= 0) {
    return '0s';
  }

  if (seconds < 60) {
    return `${Math.max(1, Math.round(seconds))}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return hours > 0 ? `${hours}h ${minutes}m ${secs}s` : `${minutes}m ${secs}s`;
}
