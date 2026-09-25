import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ALIGNMENT_STEP,
  MIN_ALIGNMENT_WIDTH,
  moveAlignmentEdge,
  type TabularHorizontalAlignment,
} from '@/frontend/shared/utility/tabular-horizontal-alignment';

export const alignmentControlClassName =
  'inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-medium text-[var(--madoc-accent-link,#4265e9)] shadow-sm transition-colors hover:border-[var(--madoc-accent,#4265e9)] hover:bg-[color-mix(in_srgb,var(--madoc-accent,#4265e9)_8%,white)] active:bg-[color-mix(in_srgb,var(--madoc-accent,#4265e9)_16%,white)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--madoc-accent,#4265e9)] disabled:cursor-default disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white aria-pressed:border-[var(--madoc-accent,#4265e9)] aria-pressed:bg-[var(--madoc-accent,#4265e9)] aria-pressed:text-[var(--madoc-accent-text,#fff)] aria-pressed:hover:bg-[var(--madoc-accent,#4265e9)] data-[primary=true]:border-[var(--madoc-accent,#4265e9)] data-[primary=true]:bg-[var(--madoc-accent,#4265e9)] data-[primary=true]:text-[var(--madoc-accent-text,#fff)] data-[primary=true]:hover:brightness-110';

interface TabularNetAlignmentControlsProps {
  tooltipId: string;
  value: TabularHorizontalAlignment;
  onChange: (value: TabularHorizontalAlignment) => void;
  onApply: () => void;
  onCancel: () => void;
  onReset: () => void;
  disabled: boolean;
}

export function TabularNetAlignmentControls({
  value,
  tooltipId,
  onChange,
  onApply,
  onCancel,
  onReset,
  disabled,
}: TabularNetAlignmentControlsProps) {
  const { t } = useTranslation();
  return (
    <fieldset
      disabled={disabled}
      className="min-w-0 shrink-0 rounded-md border border-gray-200 bg-white p-3 text-sm shadow-sm"
      onKeyDown={event => {
        event.stopPropagation();
        if (event.key === 'Escape') {
          onCancel();
        }
      }}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <strong>{t('Align table columns to this image')}</strong>
        <span>{t('Drag the table edge guides or use the sliders to adjust the table margin settings. All columns resize proportionally')}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {(['left', 'right'] as const).map(edge => (
          <label key={edge} className="flex h-9 min-w-40 flex-1 items-center gap-3">
            <span className={edge === 'left' ? 'font-medium text-[var(--madoc-accent-link,#4265e9)]' : 'font-medium text-orange-700'}>
              {edge === 'left' ? t('Left table margin') : t('Right table margin')}
            </span>
            <input
              autoFocus={edge === 'left'}
              type="range"
              className="h-5 min-w-0 flex-1 cursor-ew-resize accent-[var(--madoc-accent,#4265e9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--madoc-accent,#4265e9)]"
              data-tooltip-id={tooltipId}
              data-tooltip-content={
                edge === 'left'
                  ? t('Move the left edge while keeping the right edge fixed')
                  : t('Move the right edge while keeping the left edge fixed')
              }
              min={edge === 'left' ? 0 : value.left + MIN_ALIGNMENT_WIDTH}
              max={edge === 'left' ? value.left + value.width - MIN_ALIGNMENT_WIDTH : 100}
              step={ALIGNMENT_STEP}
              value={edge === 'left' ? value.left : value.left + value.width}
              onChange={event => onChange(moveAlignmentEdge(value, edge, Number(event.target.value)))}
            />
          </label>
        ))}
        <button
          type="button"
          className={`${alignmentControlClassName} px-3`}
          data-tooltip-id={tooltipId}
          data-tooltip-content={t('Preview the original column alignment')}
          onClick={onReset}
        >
          {t('Reset alignment')}
        </button>
        <button
          type="button"
          className={`${alignmentControlClassName} px-3`}
          data-tooltip-id={tooltipId}
          data-tooltip-content={t('Discard this preview and keep the previous alignment')}
          onClick={onCancel}
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          className={`${alignmentControlClassName} px-3`}
          data-tooltip-id={tooltipId}
          data-primary="true"
          data-tooltip-content={t('Use the previewed alignment')}
          onClick={onApply}
        >
          {t('Apply alignment')}
        </button>
      </div>
    </fieldset>
  );
}
