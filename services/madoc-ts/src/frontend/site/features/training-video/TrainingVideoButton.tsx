import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { TrainingVideoDialog } from './TrainingVideoDialog';
import { TrainingVideoIcon } from './TrainingVideoIcon';
import { useTrainingVideo } from './use-training-video';
import { useIsContributionPage, useTrainingVideoProjectSlug } from './use-training-video-location';

interface TrainingVideoButtonProps {
  label?: string;
  /** Set for the site header, where projects can turn the button off. */
  followHeaderSetting?: boolean;
}

/** Opens the project's training video. Hidden when the project has none. */
export function TrainingVideoButton({ label, followHeaderSetting }: TrainingVideoButtonProps) {
  const { t } = useTranslation();
  const projectSlug = useTrainingVideoProjectSlug();
  const state = useTrainingVideo(projectSlug);
  const isContributionPage = useIsContributionPage();
  const [open, setOpen] = useState(false);
  const [withTracking, setWithTracking] = useState(false);

  if (!state.video || (followHeaderSetting && state.hideHeaderButton)) {
    return null;
  }

  const openVideo = () => {
    setWithTracking(isContributionPage && state.isLoggedIn && !state.isWatched);
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openVideo}
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-current bg-transparent px-3 py-1.5 text-sm font-semibold text-inherit hover:opacity-80"
      >
        <TrainingVideoIcon />
        <span>{label || t('Training video')}</span>
      </button>
      <TrainingVideoDialog state={state} open={open} withTracking={withTracking} onClose={() => setOpen(false)} />
    </>
  );
}

blockEditorFor(TrainingVideoButton, {
  type: 'default.TrainingVideoButton',
  label: 'Training video button',
  anyContext: [],
  requiredContext: [],
  defaultProps: {
    label: '',
    followHeaderSetting: false,
  },
  editor: {
    label: { type: 'text-field', label: 'Button text', description: 'Leave empty for "Training video"' },
    followHeaderSetting: {
      type: 'checkbox-field',
      label: 'Header button',
      inlineLabel: 'Hide when the project turns off the header button',
    },
  },
});
