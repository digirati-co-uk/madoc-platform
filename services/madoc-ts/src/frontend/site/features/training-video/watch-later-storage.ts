import { WATCH_LATER_MS } from './training-video-rules';

function storageKey(siteSlug: string, projectId: number) {
  return `madoc-training-video-later:${siteSlug}:${projectId}`;
}

/** "Watch later" is a per-browser convenience, so it lives in localStorage and fails quietly. */
export function getWatchLaterUntil(siteSlug: string, projectId: number): number | undefined {
  try {
    const value = Number(window.localStorage.getItem(storageKey(siteSlug, projectId)));
    return Number.isFinite(value) && value > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

export function setWatchLater(siteSlug: string, projectId: number, now: number) {
  try {
    window.localStorage.setItem(storageKey(siteSlug, projectId), String(now + WATCH_LATER_MS));
  } catch {
    // Without storage the prompt simply shows again on the next page.
  }
}
