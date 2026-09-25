import React from 'react';
import { SoundMix } from '@styled-icons/entypo/SoundMix';
import { SelectArrows } from '@styled-icons/entypo/SelectArrows';
import { useTranslation } from 'react-i18next';
import { ArrowDownIcon } from '@/frontend/shared/icons/ArrowDownIcon';
import { alignmentControlClassName } from './tabular-net-alignment-controls';

interface TabularNetAlignmentToolbarProps {
  expanded: boolean;
  previewing: boolean;
  disabled: boolean;
  tooltipId: string;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
  onAlign?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
}

export function TabularNetAlignmentToolbar({
  expanded,
  previewing,
  disabled,
  tooltipId,
  toggleRef,
  onToggle,
  onAlign,
  onUp,
  onDown,
  onLeft,
  onRight,
}: TabularNetAlignmentToolbarProps) {
  const { t } = useTranslation();
  return (
    <div
      role="group"
      aria-label={t('Image alignment')}
      className="absolute left-3 top-3 z-50 flex items-center gap-1.5"
    >
      <button
        ref={toggleRef}
        type="button"
        className={`${alignmentControlClassName} w-9 px-0`}
        aria-label={t('Image alignment')}
        aria-expanded={expanded}
        aria-pressed={expanded}
        data-tooltip-id={tooltipId}
        data-tooltip-content={
          expanded ? t('Hide table and image alignment controls') : t('Show table and image alignment controls')
        }
        disabled={disabled}
        onClick={onToggle}
      >
        <SoundMix size={20} aria-hidden="true" />
      </button>
      {expanded ? (
        <>
          <span aria-hidden="true" className="mx-0.5 h-5 border-l border-gray-300" />
          {[
            { label: t('Nudge table row tracking up'), rotation: 180, onClick: onUp },
            { label: t('Nudge table row tracking down'), rotation: 0, onClick: onDown },
            { label: t('Move table outline left'), rotation: 90, onClick: onLeft },
            { label: t('Move table outline right'), rotation: -90, onClick: onRight },
          ].map(({ label, rotation, onClick }) => (
            <button
              key={label}
              type="button"
              className={`${alignmentControlClassName} w-9 px-0`}
              aria-label={label}
              data-tooltip-id={tooltipId}
              data-tooltip-content={label}
              disabled={disabled || previewing || !onClick}
              onClick={onClick}
            >
              <ArrowDownIcon
                width={20}
                height={20}
                aria-hidden="true"
                style={{ transform: `rotate(${rotation}deg)`, fill: 'currentColor' }}
              />
            </button>
          ))}
          {onAlign ? (
            <button
              type="button"
              className={`${alignmentControlClassName} w-9 px-0`}
              aria-label={t('Align table columns to this image')}
              aria-pressed={previewing}
              data-tooltip-id={tooltipId}
              data-tooltip-content={t('Align the left and right edges; resize all columns proportionally')}
              disabled={disabled || previewing}
              onClick={onAlign}
            >
              <SelectArrows size={20} aria-hidden="true" style={{ transform: 'rotate(90deg)' }} />
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
