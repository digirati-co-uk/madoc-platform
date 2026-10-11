import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HrefLink } from '../../../shared/utility/href-link';
import { TrainingVideoIcon } from './TrainingVideoIcon';
import { TrainingVideoPlayer } from './TrainingVideoPlayer';
import { TrainingVideoContent } from './training-video-rules';

export interface TrainingVideoTracking {
  onWatchLater: () => void;
  onMarkWatched: () => Promise<void>;
  isSaving: boolean;
}

interface TrainingVideoModalProps {
  open: boolean;
  video: TrainingVideoContent;
  helpPagePath?: string;
  /** Only passed on the contribution page, for a volunteer who hasn't marked the video as watched. */
  tracking?: TrainingVideoTracking;
  onClose: () => void;
}

const secondaryButton =
  'rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-900 hover:border-gray-400 disabled:opacity-50';
const primaryButton =
  'rounded-lg bg-[var(--madoc-accent,rgb(74_103_228))] px-4 py-2.5 font-bold text-white hover:opacity-90 disabled:opacity-50';

export function TrainingVideoModal({ open, video, helpPagePath, tracking, onClose }: TrainingVideoModalProps) {
  const { t } = useTranslation();
  const dialog = useRef<HTMLDialogElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  // Escape and the help link leave without saving; on the contribution page that counts as "watch later".
  const dismiss = tracking ? tracking.onWatchLater : onClose;

  useEffect(() => {
    const element = dialog.current;
    if (!element) {
      return;
    }
    if (open && !element.open) {
      setConfirming(false);
      setSaveFailed(false);
      element.showModal();
    }
    if (!open && element.open) {
      element.close();
    }
  }, [open]);

  const markWatched = async () => {
    if (!tracking) {
      return;
    }
    setSaveFailed(false);
    try {
      await tracking.onMarkWatched();
    } catch {
      setSaveFailed(true);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="training-video-title"
      onCancel={event => {
        event.preventDefault();
        dismiss();
      }}
      className="w-[calc(100%-2rem)] max-w-3xl rounded-xl border-0 bg-white p-0 shadow-2xl backdrop:bg-black/75"
    >
      {open ? (
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="training-video-title" className="m-0 text-xl font-semibold text-gray-900">
                {video.title || t('Training video')}
              </h2>
              {tracking ? (
                <p className="mb-0 mt-1 text-gray-700">
                  {t('Please watch this training video before starting any tasks.')}
                </p>
              ) : video.intro ? (
                <p className="mb-0 mt-1 text-gray-700">{video.intro}</p>
              ) : null}
            </div>
            {tracking ? null : (
              <button
                type="button"
                onClick={onClose}
                aria-label={t('Close')}
                className="rounded-full p-2 text-2xl leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                ×
              </button>
            )}
          </div>

          <TrainingVideoPlayer link={video.link} title={video.title} />

          {helpPagePath ? (
            <HrefLink
              href={helpPagePath}
              onClick={dismiss}
              className="self-start font-semibold text-gray-700 underline"
            >
              {t('More help for this project')}
            </HrefLink>
          ) : null}

          {tracking && confirming ? (
            <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4" role="alertdialog" aria-live="polite">
              <p className="m-0 text-gray-900">
                {t('Are you sure? This video won’t show again, but you can watch it at any time by pressing')}{' '}
                <span className="inline-flex translate-y-1 items-center" aria-label={t('Training video')}>
                  <TrainingVideoIcon />
                </span>{' '}
                {t('at the top of the page.')}
              </p>
              {saveFailed ? (
                <p role="alert" className="m-0 text-sm font-semibold text-red-700">
                  {t('Sorry, that didn’t save. Please try again.')}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button type="button" className={secondaryButton} onClick={() => setConfirming(false)}>
                  {t('Go back')}
                </button>
                <button type="button" className={primaryButton} disabled={tracking.isSaving} onClick={markWatched}>
                  {tracking.isSaving ? t('Saving...') : t('Yes, mark as watched')}
                </button>
              </div>
            </div>
          ) : tracking ? (
            <div className="flex flex-wrap gap-3">
              <button type="button" className={secondaryButton} onClick={tracking.onWatchLater}>
                {t('Watch later and close')}
              </button>
              <button type="button" className={primaryButton} onClick={() => setConfirming(true)}>
                {t('Mark as watched and close')}
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button type="button" className={secondaryButton} onClick={onClose}>
                {t('Close')}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </dialog>
  );
}
