import React from 'react';
import type { TFunction } from 'i18next';
import { Button } from '@/frontend/shared/navigation/Button';
import type { TabularWizardStep } from '../types';

interface TabularWizardHeaderProps {
  t: TFunction;
  steps: TabularWizardStep[];
  currentStep: number;
  maxReachedStep: number;
  completeStepId: number;
  isProjectCompleted: boolean;
  onStepClick: (id: number, isDisabled: boolean) => void;
  showActions: boolean;
  onCancel: () => void;
  onSaveAndContinue: () => void;
  isSaveDisabled: boolean;
}

export function TabularWizardHeader(props: TabularWizardHeaderProps) {
  const {
    t,
    steps,
    currentStep,
    maxReachedStep,
    completeStepId,
    isProjectCompleted,
    onStepClick,
    showActions,
    onCancel,
    onSaveAndContinue,
    isSaveDisabled,
  } = props;

  return (
    <div className="mb-6 border-b border-black/25 border-t border-white/10 bg-[#273668] px-8 pb-[14px] pt-[18px] text-white">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="flex items-center gap-[14px]">
            {steps.map((item, index) => {
              const isVisited = maxReachedStep >= item.id || (item.id === completeStepId && isProjectCompleted);
              const isDone = currentStep > item.id || (item.id === completeStepId && isProjectCompleted);
              const isActive = currentStep === item.id || (item.id === completeStepId && isProjectCompleted);
              const isLockedByCompletion = isProjectCompleted && item.id !== completeStepId;
              const isDisabled = !!item.disabled || isLockedByCompletion || !isVisited;
              const stepButtonClasses = [
                'flex items-center gap-3 border text-left transition-colors',
                isActive
                  ? 'rounded-md border-[#8DA0FF] bg-white/10 px-2 py-1'
                  : 'border-transparent bg-transparent px-0 py-0',
                isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100',
              ].join(' ');
              const circleClasses = [
                'inline-flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-semibold',
                isDone ? 'bg-[#8DA0FF] text-white' : '',
                !isDone && isActive
                  ? 'border-2 border-[#8DA0FF] bg-white text-[#273668] shadow-[0_0_0_2px_rgba(141,160,255,0.35)]'
                  : '',
                !isDone && !isActive ? 'bg-[#cdd4ea] text-[#273668]' : '',
              ].join(' ');
              const connectorClasses = [
                'h-0.5 w-11 flex-none',
                isDone ? 'bg-[#8DA0FF]' : 'bg-[#4a5b9e]',
                isDisabled ? 'opacity-40' : 'opacity-100',
              ].join(' ');

              return (
                <React.Fragment key={item.id}>
                  <button
                    type="button"
                    onClick={() => onStepClick(item.id, isDisabled)}
                    aria-current={isActive ? 'step' : undefined}
                    className={stepButtonClasses}
                  >
                    <span className={circleClasses}>{isDone ? '✓' : ''}</span>
                    <span className="grid gap-0.5">
                      <span className={`text-base ${isActive ? 'font-semibold text-white' : 'font-medium text-white/95'}`}>
                        {item.label}
                      </span>
                      {isActive ? (
                        <span className="text-[11px] uppercase tracking-[0.04em] text-[#b9c8ff]">{t('Current step')}</span>
                      ) : null}
                      {!isActive && !isDisabled && item.id !== completeStepId ? (
                        <span className="text-xs underline opacity-90">
                          {isDone ? t('Click to edit') : t('Click to return')}
                        </span>
                      ) : null}
                    </span>
                  </button>
                  {index < steps.length - 1 ? <span className={connectorClasses} /> : null}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        {showActions ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" onClick={onCancel}>
              {t('Cancel')}
            </Button>
            <Button $primary type="button" disabled={isSaveDisabled} onClick={onSaveAndContinue}>
              {t('Save and continue')}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
