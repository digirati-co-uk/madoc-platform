import React from 'react';
import type { TFunction } from 'i18next';
import { PanIcon } from '@/frontend/shared/icons/PanIcon';
import { ArrowDownIcon } from '@/frontend/shared/icons/ArrowDownIcon';

type TabularCanvasControlsHelpProps = {
  t: TFunction;
  withTopDivider?: boolean;
  className?: string;
};

export function TabularCanvasControlsHelp({
  t,
  withTopDivider = false,
  className,
}: TabularCanvasControlsHelpProps) {
  const containerClassName = withTopDivider ? 'mt-2 grid gap-3 border-t border-[#ced8ff] pt-2' : 'grid gap-3';

  return (
    <div className={`${containerClassName}${className ? ` ${className}` : ''}`}>
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
          {t('Nudge controls appear only when Use zoom tracking is enabled. To change this, go back to Additional settings.')}
        </div>
      </div>
    </div>
  );
}
