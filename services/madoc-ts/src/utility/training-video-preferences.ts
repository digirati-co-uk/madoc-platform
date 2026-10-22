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
