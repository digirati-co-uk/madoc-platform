import React, { useEffect, useState } from 'react';
import { useSite } from '../../../shared/hooks/use-site';
import { useRouteContext } from '../../hooks/use-route-context';
import { TrainingVideoDialog } from './TrainingVideoDialog';
import { shouldAutoOpenTrainingVideo } from './training-video-rules';
import { useTrainingVideo } from './use-training-video';
import { getWatchLaterUntil } from './watch-later-storage';

/** Opens the training video on the contribution page until the volunteer marks it as watched. */
export function TrainingVideoContributionPrompt() {
  const { projectId: projectSlug } = useRouteContext();
  const site = useSite();
  const state = useTrainingVideo(projectSlug);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const { projectId, video, isLoggedIn, isWatched, isWatchedLoading, showOnContributionPage } = state;

  // Decide once per page, after the project, video and watched flag have loaded.
  useEffect(() => {
    if (checked || !projectId || !video || isWatchedLoading) {
      return;
    }
    setChecked(true);
    setOpen(
      shouldAutoOpenTrainingVideo({
        enabled: showOnContributionPage,
        isLoggedIn,
        hasVideo: true,
        isWatched,
        watchLaterUntil: getWatchLaterUntil(site.slug, projectId),
        now: Date.now(),
      })
    );
  }, [checked, isLoggedIn, isWatched, isWatchedLoading, projectId, showOnContributionPage, site.slug, video]);

  return <TrainingVideoDialog state={state} open={open} withTracking onClose={() => setOpen(false)} />;
}
