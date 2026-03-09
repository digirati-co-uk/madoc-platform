import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { ErrorMessage } from '@/frontend/shared/callouts/ErrorMessage';
import { Button, ButtonRow, TinyButton } from '@/frontend/shared/navigation/Button';
import { ModalButton } from '@/frontend/shared/components/Modal';
import { LinkIcon } from '@/frontend/shared/icons/LinkIcon';

interface TabularProjectSettingsStepProps {
  t: TFunction;
  enableZoomTracking: boolean;
  hasImage: boolean;
  manifestId?: string;
  canvasId?: string;
  selectedCanvasLabel?: string;
  selectedCanvasThumbnail?: string;
  iiifBrowserSelection: string | null;
  iiifError: string | null;
  iiifBrowser: ReactNode;
  onEnableZoomTrackingChange: (value: boolean) => void;
  onClearImageSelection: () => void;
  onRegisterBrowserClose: (close?: () => void) => void;
  onSave: () => void;
  onCancel: () => void;
}

const URI_COPY_TIMEOUT = 1800;

function compactUri(value: string) {
  const startLength = 30;
  const endLength = 20;

  if (value.length <= startLength + endLength + 3) {
    return value;
  }

  return `${value.slice(0, startLength)}...${value.slice(-endLength)}`;
}

function UriField(props: { label: string; value?: string; t: TFunction }) {
  const { label, value, t } = props;
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (copyState !== 'copied' || typeof window === 'undefined') {
      return;
    }

    const timeout = window.setTimeout(() => setCopyState('idle'), URI_COPY_TIMEOUT);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const onCopy = useCallback(async () => {
    if (!value) {
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      setCopyState('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
  }, [value]);

  if (!value) {
    return null;
  }

  return (
    <div className="grid gap-1">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#1f2d5a]/80">{label}</div>
      <button
        type="button"
        onClick={onCopy}
        title={value}
        aria-label={t('Copy URI')}
        className="group flex min-h-[30px] w-full items-center gap-2 rounded border border-[#cfd6e5] bg-white/95 px-2 py-1 text-left text-[11px] text-[#1f2d5a] hover:bg-white"
      >
        <span className="min-w-0 flex-1 truncate">{compactUri(value)}</span>
        <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-[#d4d6df] bg-white text-[#36507f] group-hover:bg-[#edf2ff]">
          <LinkIcon className="text-[12px]" />
        </span>
      </button>
      {copyState === 'copied' ? (
        <div className="text-[10px] text-[#166534]">{t('Copied to clipboard')}</div>
      ) : copyState === 'error' ? (
        <div className="text-[10px] text-[#b91c1c]">{t('Clipboard unavailable. Copy manually.')}</div>
      ) : null}
    </div>
  );
}

export function TabularProjectSettingsStep(props: TabularProjectSettingsStepProps) {
  const {
    t,
    enableZoomTracking,
    hasImage,
    manifestId,
    canvasId,
    selectedCanvasLabel,
    selectedCanvasThumbnail,
    iiifBrowserSelection,
    iiifError,
    iiifBrowser,
    onEnableZoomTrackingChange,
    onClearImageSelection,
    onRegisterBrowserClose,
    onSave,
    onCancel,
  } = props;
  const showZoomTrackingHint = enableZoomTracking && !hasImage;
  const zoomTrackingHint = t('Select a reference canvas to enable zoom tracking and Cast a net.');
  const canOpenCanvasUri = canvasId ? /^https?:\/\//i.test(canvasId) : false;

  return (
    <>
      <h2 className="text-2xl font-light mb-1">{t('Additional settings')}</h2>
      <hr className="mb-4" />

      <div className="mb-6">
        <div className="text-md mb-1">
          {t('' + 'Select to enable the zoom tracking option for' + ' your tabular model')}
        </div>
        <div className="text-sm w-[700px] mb-4 font-light">
          {t(
            'Zoom tracking enables the application to support contributor users as they' +
              ' navigate through the tabular data structure. The zoom tracking will  attempt to' +
              ' move the image focus to reflect the user’s current location  in the table structure.' +
              ' To provide this option to the user, casting a  grid on a reference image is necessary.'
          )}
        </div>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={enableZoomTracking}
            onChange={event => onEnableZoomTrackingChange(event.currentTarget.checked)}
          />
          <span className="text-sm font-medium">{t('Use zoom tracking')}</span>
        </label>
      </div>

      <div>
        <div className="text-md mb-1">
          {t('Reference image')} <small> {t('(optional)')}</small>
        </div>
        <div className="text-sm w-[700px] mb-4 font-light">
          {t(
            'Select an image from the content which will be used within this tabular data project to help guide configuration of the model in the next steps. Selecting an image from the content is is required when the zoom tracking selection is on; optional when zoom tracking is off.'
          )}
        </div>

        {hasImage ? (
          <div className="rounded-md border border-green-200 bg-green-50/80 p-3 text-sm mb-2">
            <div className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-[7.5rem_minmax(0,1fr)] md:items-start">
                <div className="h-[7.5rem] w-[7.5rem] overflow-hidden rounded border border-[#cfd6e5] bg-white">
                  {selectedCanvasThumbnail ? (
                    canOpenCanvasUri ? (
                      <a href={canvasId} target="_blank" rel="noreferrer" className="block h-full w-full">
                        <img
                          src={selectedCanvasThumbnail}
                          alt={selectedCanvasLabel || t('Selected canvas thumbnail')}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ) : (
                      <img
                        src={selectedCanvasThumbnail}
                        alt={selectedCanvasLabel || t('Selected canvas thumbnail')}
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <div className="grid h-full place-items-center px-2 text-center text-[11px] text-gray-600">
                      {t('Thumbnail unavailable')}
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <div className="text-sm font-semibold text-[#1f2d5a]">
                    {selectedCanvasLabel || t('Selected canvas')}
                  </div>
                  <UriField label={t('Canvas URI')} value={canvasId} t={t} />
                  <UriField label={t('Manifest URI')} value={manifestId} t={t} />
                </div>
              </div>
              <div className="text-xs text-gray-700">
                {t('Need a different canvas? Use Browse IIIF resources to select an alternative.')}
              </div>
              <div>
                <TinyButton onClick={onClearImageSelection}>{t('Clear selection')}</TinyButton>
              </div>
            </div>
          </div>
        ) : null}

        {!hasImage && iiifBrowserSelection ? <div className="text-xs text-gray-600">{iiifBrowserSelection}</div> : null}

        {iiifError ? <ErrorMessage>{iiifError}</ErrorMessage> : null}

        <div className="flex items-center gap-2">
          <ModalButton
            title={t('Browse IIIF resources')}
            modalSize="lg"
            allowResize={false}
            render={({ close }) => {
              onRegisterBrowserClose(close);

              return iiifBrowser;
            }}
          >
            <Button>{t('Browse IIIF resources')}</Button>
          </ModalButton>

          {hasImage ? <span className="text-sm text-gray-600">{t('Canvas selected')}</span> : null}
        </div>
        {showZoomTrackingHint && (
          <div className="rounded bg-[#dfe5ff] p-1 text-xs mt-1 text-[#1f2d5a] w-96">
            <span aria-hidden={!showZoomTrackingHint}>{zoomTrackingHint}</span>
          </div>
        )}
      </div>

      <ButtonRow>
        <Button type="button" onClick={onCancel}>
          {t('Cancel')}
        </Button>
        <Button $primary disabled={enableZoomTracking && !hasImage} onClick={onSave}>
          {t('Save and continue')}
        </Button>
      </ButtonRow>
    </>
  );
}
