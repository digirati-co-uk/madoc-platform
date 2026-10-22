import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HrefLink } from '../../../shared/utility/href-link';
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
  /** Only passed on contribution pages for a logged-in volunteer. */
  tracking?: TrainingVideoTracking;
  onClose: () => void;
}

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900';
const secondaryButton = `min-h-11 rounded-lg border-2 border-gray-500 bg-white px-4 py-2.5 font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-50 ${focusRing}`;
const primaryButton = `min-h-11 rounded-lg bg-[var(--madoc-accent,#4265e9)] px-4 py-2.5 font-bold text-[var(--madoc-accent-text,#fff)] hover:bg-[var(--madoc-accent-selected,#3551ba)] hover:text-[var(--madoc-accent-selected-text,#fff)] disabled:cursor-wait disabled:opacity-50 ${focusRing}`;

export function TrainingVideoModal({ open, video, helpPagePath, tracking, onClose }: TrainingVideoModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const confirmationId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const confirmHeading = useRef<HTMLParagraphElement>(null);
  const markButton = useRef<HTMLButtonElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const isSaving = !!tracking?.isSaving;
  const dismiss = tracking ? tracking.onWatchLater : onClose;

  useEffect(() => {
    const element = dialog.current;
    if (!element || !open) {
      return;
    }
    setConfirming(false);
    setSaveFailed(false);
    element.showModal();
    heading.current?.focus();
    return () => element.close();
  }, [open]);

  useEffect(() => {
    if (confirming) {
      confirmHeading.current?.focus();
    }
  }, [confirming]);

  const markWatched = async () => {
    if (!tracking || isSaving) {
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
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        if (!isSaving) dismiss();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl flex-col overflow-hidden rounded-xl border-0 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-black/75 open:flex"
    >
      {open ? (
        <>
          <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  ref={heading}
                  tabIndex={-1}
                  id={titleId}
                  className="m-0 break-words text-lg font-semibold outline-none sm:text-xl"
                >
                  {video.title || t('Training video')}
                </h2>
                {tracking ? (
                  <p className="mb-0 mt-2 text-sm font-semibold">
                    {t('Please watch this training video before starting any tasks.')}
                  </p>
                ) : null}
                {video.intro ? <p className="mb-0 mt-2 text-gray-700">{video.intro}</p> : null}
              </div>
              <button
                type="button"
                onClick={dismiss}
                disabled={isSaving}
                aria-label={t('Close')}
                className={`-m-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 ${focusRing}`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <TrainingVideoPlayer key={video.link} link={video.link} title={video.title} />

            {helpPagePath ? (
              <HrefLink
                href={helpPagePath}
                aria-disabled={isSaving || undefined}
                onClick={event => {
                  if (isSaving) event.preventDefault();
                  else if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) dismiss();
                }}
                className={`mt-4 inline-block rounded font-semibold text-gray-700 underline ${focusRing}`}
              >
                {t('More help for this project')}
              </HrefLink>
            ) : null}
          </div>

          <div className="max-h-[60dvh] shrink-0 overflow-y-auto border-t border-gray-200 bg-gray-50 p-4 sm:px-6">
            <span role="status" className="sr-only">
              {isSaving ? t('Saving...') : ''}
            </span>
            {tracking && confirming ? (
              <div role="group" aria-labelledby={confirmationId} className="flex flex-col gap-3">
                <p ref={confirmHeading} tabIndex={-1} id={confirmationId} className="m-0 font-semibold outline-none">
                  {t('Mark this training video as watched?')}
                </p>
                <p className="m-0 text-sm text-gray-700">
                  {t('This video won’t open automatically again.')}{' '}
                  {helpPagePath ? t('You can watch it again on the project help page.') : null}
                </p>
                {saveFailed ? (
                  <p role="alert" className="m-0 text-sm font-semibold text-red-700">
                    {t('Sorry, that didn’t save. Please try again.')}
                  </p>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className={secondaryButton}
                    disabled={isSaving}
                    onClick={() => {
                      setConfirming(false);
                      requestAnimationFrame(() => markButton.current?.focus());
                    }}
                  >
                    {t('Go back')}
                  </button>
                  <button type="button" className={primaryButton} disabled={isSaving} onClick={markWatched}>
                    {isSaving ? t('Saving...') : t('Yes, mark as watched')}
                  </button>
                </div>
              </div>
            ) : tracking ? (
              <div className="flex flex-col gap-3">
                <p className="m-0 text-sm text-gray-600">
                  {t('Choose “Watch later” to hide this reminder for 24 hours.')}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button type="button" className={secondaryButton} onClick={tracking.onWatchLater}>
                    {t('Watch later and close')}
                  </button>
                  <button ref={markButton} type="button" className={primaryButton} onClick={() => setConfirming(true)}>
                    {t('Mark as watched and close')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button type="button" className={secondaryButton} onClick={onClose}>
                  {t('Close')}
                </button>
              </div>
            )}
          </div>
        </>
      ) : null}
    </dialog>
  );
}
