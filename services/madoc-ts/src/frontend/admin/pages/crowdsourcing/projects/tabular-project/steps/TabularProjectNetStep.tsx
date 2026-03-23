import React, { ComponentType, ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { ModalButton } from '@/frontend/shared/components/Modal';
import { TabularSplitView } from '@/frontend/shared/components/TabularSplitView';
import { BrowserComponent } from '@/frontend/shared/utility/browser-component';
import { Button, ButtonRow, TinyButton } from '@/frontend/shared/navigation/Button';
import { TabularHeadingsTable } from '../../../../../components/tabular/cast-a-net/TabularHeadingsTable';
import type { NetConfig } from '../../../../../components/tabular/cast-a-net/types';
import { TABULAR_WIZARD_CAST_A_NET_ROWS } from '../constants';
import type { CastANetStepComponentProps } from '../types';

interface TabularProjectNetStepProps {
  t: TFunction;
  requiresNetStep: boolean;
  manifestId?: string;
  canvasId?: string;
  netConfig: NetConfig;
  castANetHeight: number;
  isDividerHover: boolean;
  netColumnCount: number;
  headings: string[];
  tooltips: string[];
  iiifBrowser: ReactNode;
  onNetConfigChange: (next: NetConfig) => void;
  onSave: () => void;
  onClearImageSelection: () => void;
  onRegisterBrowserClose: (close?: () => void) => void;
  onStartResize: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDividerHoverChange: (isHover: boolean) => void;
  onCancel: () => void;
  CastANetComponent: ComponentType<CastANetStepComponentProps>;
}

export function TabularProjectNetStep(props: TabularProjectNetStepProps) {
  const {
    t,
    requiresNetStep,
    manifestId,
    canvasId,
    netConfig,
    castANetHeight,
    isDividerHover,
    netColumnCount,
    headings,
    tooltips,
    iiifBrowser,
    onNetConfigChange,
    onSave,
    onClearImageSelection,
    onRegisterBrowserClose,
    onStartResize,
    onDividerHoverChange,
    onCancel,
    CastANetComponent,
  } = props;

  return (
    <>
      {requiresNetStep ? (
        <div className="grid grid-cols-[280px_minmax(0,1fr)] items-stretch gap-4">
          <div className="rounded border border-[#d6d6d6] bg-[#f4f4f4] p-3">
            <div className="text-2xl font-light mb-1">{t('Cast a net')}</div>
            <hr />
            <div className="mt-1  pt-4">
              <div className="rounded border border-[#ced8ff] bg-[#e8edff] p-3 text-sm leading-[1.35] text-[#1f2d5a]">
                {t(
                  'Align the tabular net so that it aligns with the table in the example image. Start by aligning the header (pink row) with the headings defined in the previous step.'
                )}
                <br />
                <br />
                {t('Use the non-editable table below as reference for your row and column layout.')}
                <br />
                <br />
                {t('Hold ')}
                <small>ALT+SHIFT</small> {t('to move the whole tabular net. ')}
                {t('Hold ')}
                <small>SHIFT</small>{' '}
                {t(
                  'to click and select multiple row(s) or multiple column(s). Once selected, click on one of the selected lines to move them together.'
                )}
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 my-2">
              <ModalButton
                title={t('Browse IIIF resources')}
                modalSize="lg"
                allowResize={false}
                render={({ close }) => {
                  onRegisterBrowserClose(close);
                  return iiifBrowser;
                }}
              >
                <TinyButton>{t('Select a different image')}</TinyButton>
              </ModalButton>
              <TinyButton onClick={onClearImageSelection}>{t('Remove selected image')}</TinyButton>
            </div>
          </div>

          <TabularSplitView
            style={{ rowGap: 12 }}
            topTrack={`${castANetHeight}px`}
            bottomTrack="auto"
            dividerHeight={18}
            dividerAriaLabel={t('Resize cast-a-net and table')}
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
                  height={castANetHeight}
                />
              </BrowserComponent>
            }
            bottomPanel={
              <div className="overflow-auto border border-[#d6d6d6] bg-white">
                <TabularHeadingsTable
                  columns={netColumnCount}
                  visibleRows={TABULAR_WIZARD_CAST_A_NET_ROWS}
                  headings={headings}
                  tooltips={tooltips}
                  onChangeHeadings={() => {
                    // Intentionally read-only in Cast a net step.
                  }}
                  activeColumn={-1}
                  issues={[]}
                  disabled
                />
              </div>
            }
          />
        </div>
      ) : (
        <div className="p-3 text-[13px]">{t('Select a reference canvas to use Cast a net.')}</div>
      )}
      <ButtonRow>
        <Button type="button" onClick={onCancel}>
          {t('Cancel')}
        </Button>
        <Button $primary onClick={onSave}>
          {t('Save and continue')}
        </Button>
      </ButtonRow>
    </>
  );
}
