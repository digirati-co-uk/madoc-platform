import { type ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { ErrorMessage } from '@/frontend/shared/callouts/ErrorMessage';
import { Button, TinyButton } from '@/frontend/shared/navigation/Button';
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
}

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

  if (!value) {
    return null;
  }

  const canOpenUri = /^https?:\/\//i.test(value);

  return (
    <div className="grid gap-1">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#1f2d5a]/80">{label}</div>
      {canOpenUri ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          aria-label={t('Open URI')}
          title={value}
          className="group inline-flex min-w-0 w-full items-center gap-1.5 rounded border border-transparent px-1.5 py-1 text-[11px] font-medium text-[#2a4178] hover:border-[#d7deef] hover:bg-[#edf2ff]/70 hover:text-[#17306f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4265e9]"
        >
          <span className="min-w-0 truncate underline decoration-transparent underline-offset-2 group-hover:decoration-current">
            {compactUri(value)}
          </span>
          <LinkIcon className="shrink-0 text-[13px] opacity-65 group-hover:opacity-100" />
        </a>
      ) : (
        <div title={value} className="min-w-0 truncate text-[11px] text-[#1f2d5a]">
          {compactUri(value)}
        </div>
      )}
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
  } = props;
  const showZoomTrackingHint = enableZoomTracking && !hasImage;
  const zoomTrackingHint = t('Select a reference canvas to continue with zoom tracking.');
  const canOpenCanvasUri = canvasId ? /^https?:\/\//i.test(canvasId) : false;

  return (
    <>
      <h2 className="text-2xl font-light mb-1">{t('Additional settings')}</h2>
      <hr className="mb-4" />

      <div className="mb-6">
        <div className="text-md mb-1">{t('Enable zoom tracking')}</div>
        <div className="text-sm w-[700px] mb-4 font-light">
          {t(
            "When enabled, the image follows the contributor's active cell. This requires a reference image and Draw table grid setup."
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
          {t('Choose one canvas to guide model setup. Required when zoom tracking is enabled.')}
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
                {t('Need a different canvas? Browse IIIF resources to choose another one.')}
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
    </>
  );
}
