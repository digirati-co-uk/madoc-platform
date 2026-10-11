import React from 'react';
import { useSite } from '../../../shared/hooks/use-site';
import { TrainingVideoModal } from './TrainingVideoModal';
import { TrainingVideoState } from './use-training-video';
import { setWatchLater } from './watch-later-storage';

interface TrainingVideoDialogProps {
  state: TrainingVideoState;
  open: boolean;
  /** Decided by whoever opens it, so the buttons don't change while the dialog is open. */
  withTracking: boolean;
  onClose: () => void;
}

export function TrainingVideoDialog({ state, open, withTracking, onClose }: TrainingVideoDialogProps) {
  const site = useSite();
  const { projectId, video } = state;

  if (!video) {
    return null;
  }

  const tracking =
    withTracking && projectId
      ? {
          onWatchLater: () => {
            setWatchLater(site.slug, projectId, Date.now());
            onClose();
          },
          onMarkWatched: async () => {
            await state.markWatched();
            onClose();
          },
          isSaving: state.isMarkingWatched,
        }
      : undefined;

  return (
    <TrainingVideoModal
      open={open}
      video={video}
      helpPagePath={state.helpPagePath}
      tracking={tracking}
      onClose={onClose}
    />
  );
}
