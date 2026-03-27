import React, { ComponentType, ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { ModalButton } from '@/frontend/shared/components/Modal';
import { TabularSplitView } from '@/frontend/shared/components/TabularSplitView';
import { Button, ButtonRow } from '@/frontend/shared/navigation/Button';
import { BrowserComponent } from '@/frontend/shared/utility/browser-component';
import { LinkIcon } from '@/frontend/shared/icons/LinkIcon';
import ResizeHandleIcon from '@/frontend/shared/icons/ResizeHandleIcon';
import { SettingsIcon } from '@/frontend/shared/icons/SettingsIcon';
import { TabularPreviewTable } from '../../../../../components/tabular/cast-a-net/TabularPreviewTable';
import type { NetConfig, TabularCellRef } from '@/frontend/shared/utility/tabular-types';
import type { CastANetStepComponentProps } from '../types';
import { PanIcon } from '@/frontend/shared/icons/PanIcon';
import { ArrowDownIcon } from '@/frontend/shared/icons/ArrowDownIcon';

const PREVIEW_NUDGE_STEP = 0.25;
const CONTRIBUTOR_CANVAS_BACKGROUND = '#E4E7F0';

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

          {shareUrl ? (
            <div className="my-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onCopyShareLink}
                  rel="noreferrer"
                  aria-label={t('copy project share link to clipboard')}
                  className="group inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded border border-[#9fb4e8] bg-[#edf2ff] px-2.5 py-1.5 text-xs font-semibold text-[#17306f] hover:bg-[#e2ebff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4265e9]"
                >
                  <span>{t('Copy share link')}</span> <LinkIcon className="text-[18px]" />
                </button>
              </div>
              {shareCopied === 'copied' ? (
                <div className="mt-1.5 text-xs text-[#166534]">{t('Share link copied.')}</div>
              ) : null}
              {shareCopied === 'error' ? (
                <div className="mt-1.5 text-xs text-[#b91c1c]">{t('Copy failed. Please copy the link manually.')}</div>
              ) : null}
            </div>
          ) : null}

          <div className="mb-3 rounded border border-[#ced8ff] bg-[#e8edff] p-3 text-[#1f2d5a]">
            <div className="text-sm leading-[1.35]">
              {t('Check your project details, model, and grid before creating the project.')}
            </div>
            {canTrackPreviewOnCanvas ? (
              <div className="mt-2 grid gap-3 border-t border-[#ced8ff] pt-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#3d4f88]">
                    <div className="flex-col">
                      <ArrowDownIcon aria-hidden className="h-3 w-3 transform rotate-180" />
                      <ArrowDownIcon aria-hidden className="h-3 w-3" />
                    </div>
                    {t('Nudge actions')}
                  </div>
                  <div className="mt-1 text-sm leading-[1.35]">
                    {t('Use Nudge to fine-tune row alignment. Saved nudges improve zoom tracking for contributors.')}
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#3d4f88]">
                    <PanIcon aria-hidden className="h-4 w-4" />
                    {t('Zoom tracking toggle')}
                  </div>
                  <div className="mt-1 text-sm leading-[1.35]">
                    {t(
                      'Nudge controls appear only when Use zoom tracking is enabled. To change this, go back to Additional settings.'
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className={hasImage ? 'grid h-[760px] content-start gap-3 overflow-hidden' : 'grid content-start gap-3'}>
          {hasImage ? (
            <TabularSplitView
              className="h-full"
              style={{ rowGap: 12 }}
              topTrack={`${previewCanvasHeight}px`}
              bottomTrack={`minmax(${previewTableHeight}px, 1fr)`}
              dividerHeight={18}
              dividerAriaLabel={t('Resize preview canvas and table')}
              onResizeStart={onStartResize}
              onDividerHoverChange={onDividerHoverChange}
              isDividerActive={isDividerHover}
              topPanel={
                <BrowserComponent fallback={<div>{t('Loading...')}</div>}>
                  <CastANetComponent
                    manifestId={manifestId!}
                    canvasId={canvasId}
                    value={netConfig}
                    onChange={onNetConfigChange}
                    height={previewCanvasHeight}
                    atlasBackgroundColor={CONTRIBUTOR_CANVAS_BACKGROUND}
                    activeCell={previewCanvasActiveCell}
                    previewOverlayOnly
                    showVerticalNudgeControls={canTrackPreviewOnCanvas}
                    onNudgeUp={() => onNudgePreviewNet(0, -PREVIEW_NUDGE_STEP)}
                    onNudgeDown={() => onNudgePreviewNet(0, PREVIEW_NUDGE_STEP)}
                  />
                </BrowserComponent>
              }
              bottomPanel={
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
                  containerHeight="100%"
                  containerWidth="100%"
                />
              }
            />
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
          {!hasImage ? (
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
              containerWidth="100%"
            />
          ) : null}
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
