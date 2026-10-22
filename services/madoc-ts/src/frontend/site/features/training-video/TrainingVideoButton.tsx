import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [openFor, setOpenFor] = useState<string>();
  const [withTracking, setWithTracking] = useState(false);

  if (!state.video || (followHeaderSetting && state.hideHeaderButton)) {
    return null;
  }

  const openVideo = () => {
    setWithTracking(isContributionPage && state.isLoggedIn && !state.isWatched);
    setOpenFor(location.key);
  };

  return (
    <>
      <button
        type="button"
        onClick={openVideo}
        className={
          'inline-flex items-center min-h-11 gap-2 whitespace-nowrap rounded-full border-0 ' +
          'bg-[var(--madoc-accent,#005cc5)] text-[var(--madoc-accent-text,#ffffff)] px-4 py-1.5 text-sm font-semibold cursor-pointer ' +
          'transition-colors duration-200 ease-out motion-reduce:transition-none ' +
          'hover:bg-[var(--madoc-accent-selected,#004a9e)] hover:text-[var(--madoc-accent-selected-text,#ffffff)] ' +
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--madoc-accent-text,#ffffff)] ' +
          'focus-visible:shadow-[0_0_0_2px_var(--madoc-accent,#005cc5),0_0_0_4px_var(--madoc-accent-text,#ffffff)]' +
          (followHeaderSetting ? ' mr-4' : '')
        }
      >
        <TrainingVideoIcon />
        <span>{label || t('Training video')}</span>
      </button>
      <TrainingVideoDialog
        state={state}
        open={openFor === location.key}
        withTracking={withTracking}
        onClose={() => setOpenFor(undefined)}
      />
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
