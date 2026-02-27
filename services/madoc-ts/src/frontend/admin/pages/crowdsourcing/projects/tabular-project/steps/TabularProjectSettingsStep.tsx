import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { ErrorMessage } from '../../../../../../shared/callouts/ErrorMessage';
import { SuccessMessage } from '../../../../../../shared/callouts/SuccessMessage';
import { Button, ButtonRow, TinyButton } from '../../../../../../shared/navigation/Button';
import { ModalButton } from '../../../../../../shared/components/Modal';

interface TabularProjectSettingsStepProps {
  t: TFunction;
  enableZoomTracking: boolean;
  hasImage: boolean;
  manifestId?: string;
  canvasId?: string;
  iiifBrowserSelection: string | null;
  iiifError: string | null;
  iiifBrowser: ReactNode;
  onEnableZoomTrackingChange: (value: boolean) => void;
  onClearImageSelection: () => void;
  onRegisterBrowserClose: (close?: () => void) => void;
  onSave: () => void;
}

export function TabularProjectSettingsStep(props: TabularProjectSettingsStepProps) {
  const {
    t,
    enableZoomTracking,
    hasImage,
    manifestId,
    canvasId,
    iiifBrowserSelection,
    iiifError,
    iiifBrowser,
    onEnableZoomTrackingChange,
    onClearImageSelection,
    onRegisterBrowserClose,
    onSave,
  } = props;

  return (
    <>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>{t('Additional settings')}</div>
      <div style={{ marginBottom: 20 }}>
        <div>{t('Select to enable the zoom tracking option for your tabular model')}</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 10, maxWidth: 600 }}>
          {t(
            'Zoom tracking enables the application to support contributor users as they  navigate through the tabular data structure. The zoom tracking will  attempt to move the image focus to reflect the user’s current location  in the table structure. To provide this option to the user, casting a  grid on a reference image is necessary.'
          )}
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            style={{ margin: 0 }}
            type="checkbox"
            checked={enableZoomTracking}
            onChange={event => onEnableZoomTrackingChange(event.currentTarget.checked)}
          />
          <span style={{ fontSize: 13 }}>{t('Use zoom tracking')}</span>
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>{t('Reference image (optional)')}</div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          {t(
            'Select an image to guide configuration. This is required when zoom tracking is on; optional when zoom tracking is off.'
          )}
        </div>

        {hasImage ? (
          <SuccessMessage>
            <div style={{ display: 'flex', flexDirection: 'column', rowGap: 4 }}>
              <div>
                {t('Selected manifest')}: <strong>{manifestId}</strong>
              </div>
              <div>
                {t('Selected canvas')}: <strong>{canvasId}</strong>
              </div>
              <TinyButton onClick={onClearImageSelection}>{t('Clear selection')}</TinyButton>
            </div>
          </SuccessMessage>
        ) : null}

        {!hasImage && iiifBrowserSelection ? (
          <div style={{ fontSize: 12, opacity: 0.75 }}>{iiifBrowserSelection}</div>
        ) : null}

        {iiifError ? <ErrorMessage>{iiifError}</ErrorMessage> : null}

        {enableZoomTracking && !hasImage ? (
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            {t('Select a reference canvas to enable zoom tracking and Cast a net.')}
          </div>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ModalButton
            title={t('Browse IIIF resources')}
            modalSize="lg"
            allowResize={false}
            render={({ close }) => {
              onRegisterBrowserClose(close);

              return iiifBrowser;
            }}
          >
            <Button>{t('Browse manifests')}</Button>
          </ModalButton>
          {hasImage ? <span style={{ fontSize: 12, opacity: 0.75 }}>{t('Canvas selected')}</span> : null}
        </div>
      </div>

      <ButtonRow>
        <Button $primary disabled={enableZoomTracking && !hasImage} onClick={onSave}>
          {t('Save')}
        </Button>
      </ButtonRow>
    </>
  );
}
