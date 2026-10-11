/** @jest-environment node */
import {
  findTrainingVideoBlock,
  resolveTrainingVideoSource,
  shouldAutoOpenTrainingVideo,
  toPageApiPath,
  TRAINING_VIDEO_BLOCK_TYPE,
} from '../../../src/frontend/site/features/training-video/training-video-rules';
import { markTrainingVideoWatched, getWatchedTrainingVideos } from '../../../src/utility/training-video-preferences';

const base = { enabled: true, isLoggedIn: true, hasVideo: true, isWatched: false, now: 1000 };

describe('shouldAutoOpenTrainingVideo', () => {
  test('opens for a logged-in volunteer who has not watched', () => {
    expect(shouldAutoOpenTrainingVideo(base)).toBe(true);
  });
  test('stays closed when switched off, logged out, no video or already watched', () => {
    expect(shouldAutoOpenTrainingVideo({ ...base, enabled: false })).toBe(false);
    expect(shouldAutoOpenTrainingVideo({ ...base, isLoggedIn: false })).toBe(false);
    expect(shouldAutoOpenTrainingVideo({ ...base, hasVideo: false })).toBe(false);
    expect(shouldAutoOpenTrainingVideo({ ...base, isWatched: true })).toBe(false);
  });
  test('watch later hides it until the time has passed', () => {
    expect(shouldAutoOpenTrainingVideo({ ...base, watchLaterUntil: 2000 })).toBe(false);
    expect(shouldAutoOpenTrainingVideo({ ...base, watchLaterUntil: 1000 })).toBe(true);
  });
});

describe('toPageApiPath', () => {
  test('strips slashes and blanks', () => {
    expect(toPageApiPath('/help/peace/')).toBe('help/peace');
    expect(toPageApiPath('  ')).toBeUndefined();
    expect(toPageApiPath(undefined)).toBeUndefined();
  });
});

describe('findTrainingVideoBlock', () => {
  const block = (id: number, languages: string[], fallback = false) => ({
    id,
    name: 'Training video',
    type: TRAINING_VIDEO_BLOCK_TYPE,
    static_data: { link: `https://example.org/${id}` },
    lazy: false,
    i18n: { languages, sortKey: 'training', fallback },
  });
  const page: any = {
    slots: {
      main: {
        blocks: [
          { id: 1, name: 'Text', type: 'default.Markdown', static_data: {}, lazy: false },
          block(2, ['en'], true),
          block(3, ['cy']),
        ],
      },
    },
  };

  test('picks the version for the language', () => {
    expect(findTrainingVideoBlock(page, 'cy')?.id).toBe(3);
  });
  test('falls back to the master video', () => {
    expect(findTrainingVideoBlock(page, 'fr')?.id).toBe(2);
  });
  test('returns nothing for a page without one', () => {
    expect(findTrainingVideoBlock({ slots: {} } as any, 'en')).toBeUndefined();
    expect(findTrainingVideoBlock(undefined, 'en')).toBeUndefined();
  });
});

describe('resolveTrainingVideoSource', () => {
  test('converts YouTube and Vimeo page links', () => {
    expect(resolveTrainingVideoSource('https://www.youtube.com/watch?v=abc123')).toEqual({
      kind: 'iframe',
      src: 'https://www.youtube-nocookie.com/embed/abc123',
    });
    expect(resolveTrainingVideoSource('https://youtu.be/abc123')?.src).toBe(
      'https://www.youtube-nocookie.com/embed/abc123'
    );
    expect(resolveTrainingVideoSource('https://vimeo.com/76979871')?.src).toBe(
      'https://player.vimeo.com/video/76979871'
    );
  });
  test('plays direct files in a video element', () => {
    expect(resolveTrainingVideoSource('https://example.org/intro.mp4')).toEqual({
      kind: 'file',
      src: 'https://example.org/intro.mp4',
    });
  });
  test('keeps other embed links and rejects non-web links', () => {
    expect(resolveTrainingVideoSource('https://player.example.org/embed/9')?.src).toBe(
      'https://player.example.org/embed/9'
    );
    expect(resolveTrainingVideoSource('javascript:alert(1)')).toBeUndefined();
    expect(resolveTrainingVideoSource('')).toBeUndefined();
  });
});

describe('training video preferences', () => {
  test('marks a project without losing other sites or projects', () => {
    const prefs: any = { visibility: { email: 'only-me' }, trainingVideo: { '1': { '5': 'a' }, '2': { '7': 'b' } } };
    const update = markTrainingVideoWatched(prefs, 1, 9, 'c');
    expect(update.trainingVideo).toEqual({ '1': { '5': 'a', '9': 'c' }, '2': { '7': 'b' } });
    expect(getWatchedTrainingVideos({ ...prefs, ...update }, 1)).toEqual({ '5': 'a', '9': 'c' });
    expect(getWatchedTrainingVideos(undefined, 1)).toEqual({});
  });
});
