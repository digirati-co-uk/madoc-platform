import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { ErrorMessage } from '@/frontend/shared/callouts/ErrorMessage';
import { SuccessMessage } from '@/frontend/shared/callouts/SuccessMessage';
import { Button, ButtonRow, TinyButton } from '@/frontend/shared/navigation/Button';
import { ModalButton } from '@/frontend/shared/components/Modal';

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

function UriField(props: { label: string; value?: string; linkLabel: string; t: TFunction }) {
  const { label, value, linkLabel, t } = props;
  if (!value) {
    return null;
  }

  const canOpen = /^https?:\/\//i.test(value);

  return (
    <div className="grid gap-1">
      <div className="text-xs font-semibold text-[#1f2d5a]">{label}</div>
      <input
        type="text"
        value={value}
        readOnly
        onFocus={event => event.currentTarget.select()}
        className="w-full rounded border border-[#cfd6e5] bg-white px-[10px] py-2 text-xs text-[#1f2d5a]"
      />
      {canOpen ? (
        <a href={value} target="_blank" rel="noreferrer" className="text-xs">
          {linkLabel}
        </a>
      ) : (
        <div className="text-xs text-gray-600">{t('Copy this URI value to use it elsewhere.')}</div>
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
          <SuccessMessage>
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
                  <UriField label={t('Canvas URI')} value={canvasId} linkLabel={t('Open canvas URI')} t={t} />
                  <UriField label={t('Manifest URI')} value={manifestId} linkLabel={t('Open manifest URI')} t={t} />
                </div>
              </div>
              <div className="text-xs text-gray-700">
                {t('Need a different canvas? Use Browse IIIF resources to select an alternative.')}
              </div>
              <div>
                <TinyButton onClick={onClearImageSelection}>{t('Clear selection')}</TinyButton>
              </div>
            </div>
          </SuccessMessage>
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
        <div className="pl-0.5 min-h-[2.5rem] text-xs text-gray-600">
          <span className={showZoomTrackingHint ? '' : 'invisible'} aria-hidden={!showZoomTrackingHint}>
            {zoomTrackingHint}
          </span>
        </div>
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
