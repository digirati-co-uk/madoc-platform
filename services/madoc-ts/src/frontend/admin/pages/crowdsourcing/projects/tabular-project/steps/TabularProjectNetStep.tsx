import type { ComponentType, ReactNode } from 'react';
import type { TFunction } from 'i18next';
import { ModalButton } from '@/frontend/shared/components/Modal';
import { BrowserComponent } from '@/frontend/shared/utility/browser-component';
import { Button, TinyButton } from '@/frontend/shared/navigation/Button';
import { TabularHeadingsTable } from '../../../../../components/tabular/cast-a-net/TabularHeadingsTable';
import type { NetConfig, TabularCellRef } from '../../../../../components/tabular/cast-a-net/types';

const CAST_A_NET_ROWS = 5;

interface CastANetComponentProps {
  manifestId: string;
  canvasId?: string;
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  height: number;
  activeCell?: TabularCellRef | null;
  previewOverlayOnly?: boolean;
}

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
  CastANetComponent: ComponentType<CastANetComponentProps>;
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
    CastANetComponent,
  } = props;

  return (
    <>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>{t('Cast a net')}</div>
      {requiresNetStep ? (
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
            <div
              style={{
                padding: 12,
                background: '#dfe5ff',
                borderRadius: 4,
                color: '#1f2d5a',
                fontSize: 14,
                lineHeight: 1.35,
                marginBottom: 14,
              }}
            >
              {t(
                'Adjust the grid so it matches the table in the example image. Align the pink band with the headings defined earlier.'
              )}
              <br />
              <br />
              {t('Use the non-editable table below as reference for your row and column layout.')}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
              <ModalButton
                title={t('Browse IIIF resources')}
                modalSize="lg"
                render={({ close }) => {
                  onRegisterBrowserClose(close);
                  return iiifBrowser;
                }}
              >
                <TinyButton>{t('Select a different image')}</TinyButton>
              </ModalButton>
              <TinyButton onClick={onClearImageSelection}>{t('Remove selected image')}</TinyButton>
              <Button $primary onClick={onSave}>
                {t('Save')}
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <BrowserComponent fallback={<div>{t('Loading...')}</div>}>
              <CastANetComponent
                manifestId={manifestId!}
                canvasId={canvasId}
                value={netConfig}
                onChange={onNetConfigChange}
                height={castANetHeight}
              />
            </BrowserComponent>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: -4 }}>
              <div
                role="separator"
                aria-orientation="horizontal"
                aria-label={t('Resize cast-a-net and table')}
                onMouseDown={onStartResize}
                onMouseEnter={() => onDividerHoverChange(true)}
                onMouseLeave={() => onDividerHoverChange(false)}
                style={{
                  height: 18,
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
              </div>
            </div>

            <div style={{ border: '1px solid #d6d6d6', background: '#fff', overflow: 'auto' }}>
              <TabularHeadingsTable
                columns={netColumnCount}
                visibleRows={CAST_A_NET_ROWS}
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
          </div>
        </div>
      ) : (
        <div style={{ padding: 12, fontSize: 13 }}>{t('Select a reference canvas to use Cast a net.')}</div>
      )}
    </>
  );
}
