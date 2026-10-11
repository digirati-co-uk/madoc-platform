import { SiteBlock } from '../../../../types/schemas/site-page';
import { SitePage } from '../../../../types/site-pages-recursive';
import { sortSiteBlocks } from '../../../shared/page-blocks/sort-site-blocks';

export const TRAINING_VIDEO_BLOCK_TYPE = 'default.TrainingVideo';
export const WATCH_LATER_MS = 24 * 60 * 60 * 1000;

export interface TrainingVideoContent {
  link?: string;
  title?: string;
  intro?: string;
}

export type TrainingVideoSource = { kind: 'iframe'; src: string } | { kind: 'file'; src: string };

interface AutoOpenInput {
  enabled: boolean;
  isLoggedIn: boolean;
  hasVideo: boolean;
  isWatched: boolean;
  watchLaterUntil?: number;
  now: number;
}

/** Whether the contribution page should open the training video by itself. */
export function shouldAutoOpenTrainingVideo(input: AutoOpenInput): boolean {
  if (!input.enabled || !input.isLoggedIn || !input.hasVideo || input.isWatched) {
    return false;
  }
  return !isWatchLaterActive(input.watchLaterUntil, input.now);
}

export function isWatchLaterActive(watchLaterUntil: number | undefined, now: number): boolean {
  return typeof watchLaterUntil === 'number' && watchLaterUntil > now;
}

/** Page paths are stored like "/help/my-project"; the page API expects them without slashes at either end. */
export function toPageApiPath(path: string | undefined): string | undefined {
  const trimmed = (path || '').trim().replace(/^\/+|\/+$/g, '');
  return trimmed || undefined;
}

/** The main training video on a help page, using the block language rules (a fallback block is the master). */
export function findTrainingVideoBlock(page: SitePage | undefined, language: string): SiteBlock | undefined {
  if (!page?.slots) {
    return undefined;
  }
  for (const slot of Object.values(page.slots)) {
    const block = sortSiteBlocks(slot.blocks || [], language).find(b => b.type === TRAINING_VIDEO_BLOCK_TYPE);
    if (block) {
      return block;
    }
  }
  return undefined;
}

/**
 * Turns YouTube and Vimeo page links into embed links. Anything else (an embed
 * link from another service) is used as it is; direct video files play in <video>.
 */
export function resolveTrainingVideoSource(link: string | undefined): TrainingVideoSource | undefined {
  const value = (link || '').trim();
  if (!value) {
    return undefined;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return undefined;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return undefined;
  }

  const host = url.hostname.replace(/^www\./, '');

  if (/\.(mp4|webm|ogg|m4v)$/i.test(url.pathname)) {
    return { kind: 'file', src: url.toString() };
  }

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1);
    return id ? { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}` } : undefined;
  }

  if ((host === 'youtube.com' || host === 'm.youtube.com') && url.pathname === '/watch') {
    const id = url.searchParams.get('v');
    return id ? { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}` } : undefined;
  }

  if (host === 'vimeo.com') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? { kind: 'iframe', src: `https://player.vimeo.com/video/${id}` } : undefined;
  }

  return { kind: 'iframe', src: url.toString() };
}
