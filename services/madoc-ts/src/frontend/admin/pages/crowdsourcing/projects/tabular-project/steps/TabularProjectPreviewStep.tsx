import React, { ComponentType, ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { ModalButton } from '@/frontend/shared/components/Modal';
import { VerticalResizeSeparator } from '@/frontend/shared/components/VerticalResizeSeparator';
import { Button, ButtonRow } from '@/frontend/shared/navigation/Button';
import { BrowserComponent } from '@/frontend/shared/utility/browser-component';
import { LinkIcon } from '@/frontend/shared/icons/LinkIcon';
import { TabularPreviewTable } from '../../../../../components/tabular/cast-a-net/TabularPreviewTable';
import type { NetConfig, TabularCellRef } from '@/frontend/shared/utility/tabular-types';
import type { CastANetStepComponentProps } from '../types';

const PREVIEW_NUDGE_STEP = 0.25;

interface TabularProjectPreviewStepProps {
  t: TFunction;
  shareUrl: string;
  shareCopied: 'idle' | 'copied' | 'error';
  canTrackPreviewOnCanvas: boolean;
  hasImage: boolean;
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
  canRemovePreviewRow: boolean;
  onAddRow: () => void;
  onRemoveRow: () => void;
  onSave: () => void;
  onCancel: () => void;
  CastANetComponent: ComponentType<CastANetStepComponentProps>;
}

export function TabularProjectPreviewStep(props: TabularProjectPreviewStepProps) {
  const {
    t,
    shareUrl,
    shareCopied,
    canTrackPreviewOnCanvas,
    hasImage,
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
    canRemovePreviewRow,
    onAddRow,
    onRemoveRow,
    onSave,
    onCancel,
    CastANetComponent,
  } = props;

  return (
    <>
      <div className="grid grid-cols-[280px_minmax(0,1fr)] items-stretch gap-4">
        <div className="rounded border border-[#d6d6d6] bg-[#f4f4f4] p-3">
          <div className="text-2xl font-light mb-1">{t('Preview')}</div>
          <hr />

          <div className="my-3 flex items-center justify-between">
            <div className="text-[13px] font-semibold">{t('Share project outline')}</div>
            {shareUrl ? (
              <button
                type="button"
                onClick={onCopyShareLink}
                title={t('Copy share link')}
                className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded border border-[#d4d6df] bg-white text-[#283452]"
              >
                <LinkIcon className="text-[18px]" />
              </button>
            ) : null}
          </div>
          {shareUrl ? (
            <div className="mb-3">
              <input
                type="text"
                value={shareUrl}
                readOnly
                onFocus={event => event.currentTarget.select()}
                className="w-full rounded border border-[#cfd6e5] bg-white px-[10px] py-2 text-xs text-[#1f2d5a]"
              />
              <div className="mt-1.5 text-xs">
                <a href={shareUrl} target="_blank" rel="noreferrer">
                  {t('Open shared outline')}
                </a>
              </div>
              {shareCopied === 'copied' ? (
                <div className="mt-1.5 text-xs text-[#166534]">{t('Share link copied.')}</div>
              ) : null}
              {shareCopied === 'error' ? (
                <div className="mt-1.5 text-xs text-[#b91c1c]">{t('Copy failed. Please copy the link manually.')}</div>
              ) : null}
            </div>
          ) : null}

          <div className="mb-3 rounded bg-[#dfe5ff] p-3 text-sm leading-[1.35] text-[#1f2d5a]">
            {t('Review all project details, capture model data, and cast-a-net contract before creating the project.')}
          </div>

          {canTrackPreviewOnCanvas ? (
            <div className="mt-[14px] border-t border-[#d6d6d6] pt-[10px] text-[11px] opacity-80">
              {t('Nudge updates are saved with this project setup.')}
            </div>
          ) : null}
        </div>

        <div className={hasImage ? 'grid h-[760px] content-start gap-3 overflow-hidden' : 'grid content-start gap-3'}>
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
            <div className="grid min-h-[180px] place-items-center rounded border border-[#d6d6d6] bg-[#fafbff] text-[13px]">
              <div className="grid justify-items-center gap-[10px] text-center">
                <div className="text-[#41506f]">{t('Select a reference image to preview zoom tracking.')}</div>
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
              </div>
            </div>
          )}

          {hasImage ? (
            <div className="mt-[-4px] flex justify-center">
              <VerticalResizeSeparator
                ariaLabel={t('Resize preview canvas and table')}
                onResizeStart={onStartResize}
                onHoverChange={onDividerHoverChange}
                className={`h-[18px] min-w-[28px] cursor-row-resize select-none rounded border border-[#c8c8c8] text-center text-[14px] font-bold leading-[14px] ${
                  isDividerHover ? 'bg-gray-200' : 'bg-white'
                }`}
              >
                =
              </VerticalResizeSeparator>
            </div>
          ) : null}

          <TabularPreviewTable
            headings={previewColumns}
            tooltips={previewTooltips}
            rows={previewTableRowCount}
            values={previewRows}
            onChange={onPreviewRowsChange}
            activeCell={previewActiveCell}
            onActiveCellChange={onPreviewActiveCellChange}
            onAddRow={onAddRow}
            onRemoveRow={onRemoveRow}
            canRemoveRow={canRemovePreviewRow}
            addRowLabel={t('Add new row +')}
            removeRowLabel={t('Remove row -')}
            containerHeight={hasImage ? previewTableHeight : undefined}
            containerWidth="100%"
          />
        </div>
      </div>
      <ButtonRow>
        <Button type="button" onClick={onCancel}>
          {t('Cancel')}
        </Button>
        <Button $primary disabled={!canSave} onClick={onSave}>
          {t('Save and continue')}
        </Button>
      </ButtonRow>
    </>
  );
}
