import { UserPreferences } from '../extensions/site-manager/types';

/**
 * Stored in user preferences as `trainingVideo[siteId][projectId] = ISO date`.
 * User accounts are shared across sites, so the flags are kept per site.
 */
type TrainingVideoPreferences = NonNullable<UserPreferences['trainingVideo']>;

function readTrainingVideoPreferences(preferences: UserPreferences | undefined): TrainingVideoPreferences {
  const value = preferences?.trainingVideo;
  return value && typeof value === 'object' ? value : {};
}

export function getWatchedTrainingVideos(
  preferences: UserPreferences | undefined,
  siteId: number
): Record<string, string> {
  return readTrainingVideoPreferences(preferences)[String(siteId)] || {};
}

/** Returns the `trainingVideo` preference with one project marked as watched, keeping every other entry. */
export function markTrainingVideoWatched(
  preferences: UserPreferences | undefined,
  siteId: number,
  projectId: number,
  watchedAt: string
): { trainingVideo: TrainingVideoPreferences } {
  const existing = readTrainingVideoPreferences(preferences);
  const siteKey = String(siteId);

  return {
    trainingVideo: {
      ...existing,
      [siteKey]: {
        ...(existing[siteKey] || {}),
        [String(projectId)]: watchedAt,
      },
    },
  };
}
