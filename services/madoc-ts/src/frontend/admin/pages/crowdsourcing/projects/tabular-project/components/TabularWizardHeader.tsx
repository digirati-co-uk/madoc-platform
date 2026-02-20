import React from 'react';
import type { TFunction } from 'i18next';
import type { TabularWizardStep } from '../types';

interface TabularWizardHeaderProps {
  t: TFunction;
  steps: TabularWizardStep[];
  currentStep: number;
  completeStepId: number;
  isProjectCompleted: boolean;
  onStepClick: (id: number, isDisabled: boolean) => void;
}

export function TabularWizardHeader(props: TabularWizardHeaderProps) {
  const { t, steps, currentStep, completeStepId, isProjectCompleted, onStepClick } = props;

  return (
    <div
      style={{
        background: '#273668',
        color: '#fff',
        padding: '18px 32px 14px',
        marginBottom: 24,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, overflowX: 'auto' }}>
        {steps.map((item, index) => {
          const isDone = currentStep > item.id || (item.id === completeStepId && isProjectCompleted);
          const isActive = currentStep === item.id || (item.id === completeStepId && isProjectCompleted);
          const isLockedByCompletion = isProjectCompleted && item.id !== completeStepId;
          const isDisabled = !!item.disabled || isLockedByCompletion;
          const circleStyle: React.CSSProperties = {
            height: 24,
            width: 24,
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDone ? '#8DA0FF' : isActive ? '#ffffff' : '#cdd4ea',
            color: isDone ? '#fff' : isActive ? '#273668' : '#273668',
            border: isActive && !isDone ? '2px solid #8DA0FF' : '2px solid transparent',
            fontSize: 12,
            fontWeight: 600,
            flex: '0 0 auto',
            opacity: isDisabled ? 0.5 : 1,
          };
          const lineStyle: React.CSSProperties = {
            height: 2,
            width: 44,
            background: isDone ? '#8DA0FF' : '#4a5b9e',
            opacity: isDisabled ? 0.4 : 1,
            flex: '0 0 auto',
          };

          return (
            <React.Fragment key={item.id}>
              <button
                type="button"
                onClick={() => onStepClick(item.id, isDisabled)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  padding: 0,
                  textAlign: 'left',
                }}
              >
                <span style={circleStyle}>{isDone ? '✓' : ''}</span>
                <span style={{ display: 'grid', gap: 2 }}>
                  <span style={{ fontSize: 16, fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                  {isDone && !isDisabled && item.id !== completeStepId ? (
                    <span style={{ fontSize: 12, textDecoration: 'underline', opacity: 0.9 }}>
                      {t('Click to edit')}
                    </span>
                  ) : null}
                </span>
              </button>
              {index < steps.length - 1 ? <span style={lineStyle} /> : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
