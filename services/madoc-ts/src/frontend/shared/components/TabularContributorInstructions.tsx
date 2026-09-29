import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function TabularContributorInstructions({ instructions }: { instructions?: string }) {
  const { t } = useTranslation();
  const [areInstructionsExpanded, setAreInstructionsExpanded] = useState(true);

  if (!instructions) return null;

  return (
    <div className="shrink-0 overflow-hidden rounded border border-blue-300 bg-blue-100/80">
      <div className="flex items-center justify-between border-b border-blue-300 bg-blue-200/80 px-3 py-2 text-sm font-semibold text-slate-900">
        <span>{t('Instructions')}</span>
        <button
          type="button"
          className="text-xs font-medium text-slate-700 underline hover:text-slate-900"
          aria-expanded={areInstructionsExpanded}
          onClick={() => setAreInstructionsExpanded(isExpanded => !isExpanded)}
        >
          {areInstructionsExpanded ? t('Hide') : t('Show')}
        </button>
      </div>
      {areInstructionsExpanded ? (
        <div className="whitespace-pre-wrap px-3 py-2 text-sm text-slate-900">{instructions}</div>
      ) : null}
    </div>
  );
}
