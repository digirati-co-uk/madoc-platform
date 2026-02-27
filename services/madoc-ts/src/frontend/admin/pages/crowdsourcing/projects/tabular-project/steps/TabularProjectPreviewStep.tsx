import type { ComponentType, ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { ModalButton } from '@/frontend/shared/components/Modal';
import { VerticalResizeSeparator } from '@/frontend/shared/components/VerticalResizeSeparator';
import { Button, ButtonRow } from '@/frontend/shared/navigation/Button';
import { BrowserComponent } from '@/frontend/shared/utility/browser-component';
import { LinkIcon } from '@/frontend/shared/icons/LinkIcon';
import { TabularPreviewTable } from '../../../../../components/tabular/cast-a-net/TabularPreviewTable';
import type { NetConfig, TabularCellRef } from '../../../../../components/tabular/cast-a-net/types';
import {
  TABULAR_WIZARD_PREVIEW_SPLIT_DIVIDER_HEIGHT,
  TABULAR_WIZARD_PREVIEW_SPLIT_GAP,
  TABULAR_WIZARD_PREVIEW_SPLIT_TOTAL_HEIGHT,
} from '../constants';
import type { CastANetStepComponentProps } from '../types';

const PREVIEW_NUDGE_STEP = 0.25;

interface TabularProjectPreviewStepProps {
  t: TFunction;
  shareUrl: string;
  shareCopied: 'idle' | 'copied' | 'error';
  canTrackPreviewOnCanvas: boolean;
  hasImage: boolean;
  enableZoomTracking: boolean;
  manifestId?: string;
  canvasId?: string;
  netConfig: NetConfig;
  previewCanvasHeight: number;
  previewCanvasActiveCell: TabularCellRef | null;
  previewColumns: string[];
  previewTooltips: string[];
  previewTableRowCount: number;
  previewRows: string[][];
  previewActiveCell: TabularCellRef | null;
  previewTableHeight: number;
  isDividerHover: boolean;
  canSave: boolean;
  iiifBrowser: ReactNode;
  onCopyShareLink: () => void;
  onNudgePreviewNet: (x: number, y: number) => void;
  onNetConfigChange: (next: NetConfig) => void;
  onRegisterBrowserClose: (close?: () => void) => void;
  onStartResize: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDividerHoverChange: (isHover: boolean) => void;
  onPreviewRowsChange: (next: string[][]) => void;
  onPreviewActiveCellChange: (next: TabularCellRef | null) => void;
  onAddRow: () => void;
  onSave: () => void;
  CastANetComponent: ComponentType<CastANetStepComponentProps>;
}

export function TabularProjectPreviewStep(props: TabularProjectPreviewStepProps) {
  const {
    t,
    shareUrl,
    shareCopied,
    canTrackPreviewOnCanvas,
    hasImage,
    enableZoomTracking,
    manifestId,
    canvasId,
    netConfig,
    previewCanvasHeight,
    previewCanvasActiveCell,
    previewColumns,
    previewTooltips,
    previewTableRowCount,
    previewRows,
    previewActiveCell,
    previewTableHeight,
    isDividerHover,
    canSave,
    iiifBrowser,
    onCopyShareLink,
    onNudgePreviewNet,
    onNetConfigChange,
    onRegisterBrowserClose,
    onStartResize,
    onDividerHoverChange,
    onPreviewRowsChange,
    onPreviewActiveCellChange,
    onAddRow,
    onSave,
    CastANetComponent,
  } = props;

  return (
    <>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>{t('Preview')}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px minmax(0, 1fr)',
          gap: 16,
          alignItems: 'stretch',
          paddingBottom: 16,
        }}
      >
        <div style={{ border: '1px solid #d6d6d6', borderRadius: 4, background: '#f4f4f4', padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t('Share project outline')}</div>
            {shareUrl ? (
              <button
                type="button"
                onClick={onCopyShareLink}
                title={t('Copy share link')}
                style={{
                  height: 30,
                  width: 30,
                  border: '1px solid #d4d6df',
                  borderRadius: 4,
                  background: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#283452',
                  cursor: 'pointer',
                }}
              >
                <LinkIcon style={{ fontSize: 18 }} />
              </button>
            ) : null}
          </div>
          {shareUrl ? (
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                value={shareUrl}
                readOnly
                onFocus={event => event.currentTarget.select()}
                style={{
                  width: '100%',
                  border: '1px solid #cfd6e5',
                  borderRadius: 4,
                  fontSize: 12,
                  padding: '8px 10px',
                  color: '#1f2d5a',
                  background: '#fff',
                }}
              />
              <div style={{ marginTop: 6, fontSize: 12 }}>
                <a href={shareUrl} target="_blank" rel="noreferrer">
                  {t('Open shared outline')}
                </a>
              </div>
              {shareCopied === 'copied' ? (
                <div style={{ marginTop: 6, fontSize: 12, color: '#166534' }}>{t('Share link copied.')}</div>
              ) : null}
              {shareCopied === 'error' ? (
                <div style={{ marginTop: 6, fontSize: 12, color: '#b91c1c' }}>
                  {t('Copy failed. Please copy the link manually.')}
                </div>
              ) : null}
            </div>
          ) : null}

          <div
            style={{
              padding: 12,
              background: '#dfe5ff',
              borderRadius: 4,
              color: '#1f2d5a',
              fontSize: 14,
              lineHeight: 1.35,
              marginBottom: 12,
            }}
          >
            {t('Review all project details, capture model data, and cast-a-net contract before creating the project.')}
          </div>

          {canTrackPreviewOnCanvas ? (
            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #d6d6d6', fontSize: 11, opacity: 0.8 }}>
              {t('Nudge updates are saved with this project setup.')}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'grid',
            gap: TABULAR_WIZARD_PREVIEW_SPLIT_GAP,
            height: TABULAR_WIZARD_PREVIEW_SPLIT_TOTAL_HEIGHT,
            overflow: 'hidden',
          }}
        >
          {hasImage ? (
            <BrowserComponent fallback={<div>{t('Loading...')}</div>}>
              <CastANetComponent
                manifestId={manifestId!}
                canvasId={canvasId}
                value={netConfig}
                onChange={onNetConfigChange}
                height={previewCanvasHeight}
                activeCell={previewCanvasActiveCell}
                previewOverlayOnly
                showVerticalNudgeControls={canTrackPreviewOnCanvas}
                onNudgeUp={() => onNudgePreviewNet(0, -PREVIEW_NUDGE_STEP)}
                onNudgeDown={() => onNudgePreviewNet(0, PREVIEW_NUDGE_STEP)}
              />
            </BrowserComponent>
          ) : (
            <div
              style={{
                border: '1px solid #d6d6d6',
                borderRadius: 4,
                height: '100%',
                display: 'grid',
                placeItems: 'center',
                fontSize: 13,
                opacity: 0.75,
              }}
            >
              <div style={{ display: 'grid', gap: 10, textAlign: 'center', justifyItems: 'center' }}>
                <div>{t('Select a reference image to preview zoom tracking.')}</div>
                {!enableZoomTracking ? (
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
                ) : null}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: -4 }}>
            <VerticalResizeSeparator
              ariaLabel={t('Resize preview canvas and table')}
              onResizeStart={onStartResize}
              onHoverChange={onDividerHoverChange}
              style={{
                height: TABULAR_WIZARD_PREVIEW_SPLIT_DIVIDER_HEIGHT,
                minWidth: 28,
                border: '1px solid #c8c8c8',
                borderRadius: 4,
                background: isDividerHover ? '#e5e7eb' : '#fff',
                fontWeight: 700,
                lineHeight: '14px',
                textAlign: 'center',
                cursor: 'row-resize',
                userSelect: 'none',
              }}
            >
              =
            </VerticalResizeSeparator>
          </div>

          <TabularPreviewTable
            headings={previewColumns}
            tooltips={previewTooltips}
            rows={previewTableRowCount}
            values={previewRows}
            onChange={onPreviewRowsChange}
            activeCell={previewActiveCell}
            onActiveCellChange={onPreviewActiveCellChange}
            onAddRow={onAddRow}
            addRowLabel={t('+ Add row')}
            containerHeight={previewTableHeight}
            containerWidth="100%"
          />
        </div>
      </div>
      <ButtonRow>
        <Button $primary disabled={!canSave} onClick={onSave}>
          {t('Save')}
        </Button>
      </ButtonRow>
    </>
  );
}
