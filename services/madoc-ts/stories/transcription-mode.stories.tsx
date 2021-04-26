import { boolean } from '@storybook/addon-knobs';
import { useState } from 'react';
import * as React from 'react';
import { WorkflowBar } from '../src/frontend/shared/components/WorkflowBar';

export default { title: 'Transcription mode' };

// Workflow bar.

const stubActions = {
  onUnusable() {
    // no-op
  },
  onSubmit() {
    // no-op
  },
  onTooDifficult() {
    // no-op
  },
};

export const Workflow_Bar: React.FC = () => {
  const isComplete = boolean('Is complete', false);
  const isSubmitted = boolean('Is submitted', false);
  const canSubmit = boolean('Can submit', false);
  const hasExpired = boolean('Has expired', false);
  const willExpireSoon = boolean('Will expire soon', false);

  const [isUnusable, setIsUsable] = useState(false);

  return (
    <WorkflowBar
      actions={{
        onUnusable() {
          setIsUsable(u => !u);
        },
        onSubmit() {
          // no-op
        },
        onTooDifficult() {
          // no-op
        },
      }}
      states={{
        isComplete,
        isSubmitted,
        canSubmit,
        isUnusable,
        hasExpired,
        willExpireSoon,
      }}
      statistics={{
        done: 1,
        progress: 2,
        total: 10,
      }}
      expires={new Date(Date.now() + 3600)}
    />
  );
};

export const NewUserJustArrived = () => {
  return (
    <WorkflowBar
      actions={stubActions}
      states={{
        willExpireSoon: false,
        isComplete: false,
        isUnusable: false,
        isSubmitted: false,
        canSubmit: false,
        hasExpired: false,
      }}
      expires={new Date(Date.now() + 3600)}
      statistics={{
        done: 0,
        progress: 0,
        total: 10,
      }}
    />
  );
};

export const ReadyToSubmitChanges = () => {
  return (
    <WorkflowBar
      actions={stubActions}
      states={{
        willExpireSoon: false,
        isComplete: false,
        isUnusable: false,
        isSubmitted: false,
        canSubmit: true,
        hasExpired: false,
      }}
      expires={new Date(Date.now() + 3600)}
      statistics={{
        done: 0,
        progress: 1,
        total: 10,
      }}
    />
  );
};

export const ClickedTheSubmitButton = () => {
  return (
    <WorkflowBar
      actions={stubActions}
      states={{
        willExpireSoon: false,
        isComplete: false,
        isUnusable: false,
        isSubmitted: true,
        canSubmit: false,
        hasExpired: false,
      }}
      expires={new Date(Date.now() + 3600)}
      statistics={{
        done: 1,
        progress: 0,
        total: 10,
      }}
    />
  );
};

export const ClickedUnusableButton = () => {
  return (
    <WorkflowBar
      actions={stubActions}
      states={{
        willExpireSoon: false,
        isComplete: false,
        isUnusable: true,
        isSubmitted: false,
        canSubmit: false,
        hasExpired: false,
      }}
      expires={new Date(Date.now() + 3600)}
      statistics={{
        done: 1,
        progress: 0,
        total: 10,
      }}
    />
  );
};

export const FinishedLastCanvas = () => {
  return (
    <WorkflowBar
      actions={stubActions}
      states={{
        willExpireSoon: false,
        isComplete: true,
        isUnusable: false,
        isSubmitted: true,
        canSubmit: false,
        hasExpired: false,
      }}
      expires={new Date(Date.now() + 3600)}
      statistics={{
        done: 1,
        progress: 0,
        total: 10,
      }}
    />
  );
};

export const CloseToExpiring = () => {
  return (
    <WorkflowBar
      actions={stubActions}
      states={{
        willExpireSoon: true,
        isComplete: false,
        isUnusable: false,
        isSubmitted: false,
        canSubmit: true,
        hasExpired: false,
      }}
      expires={new Date(Date.now() + 3600)}
      statistics={{
        done: 1,
        progress: 0,
        total: 10,
      }}
    />
  );
};

export const AlreadyExpired = () => {
  return (
    <WorkflowBar
      actions={stubActions}
      states={{
        willExpireSoon: false,
        isComplete: false,
        isUnusable: false,
        isSubmitted: false,
        canSubmit: false,
        hasExpired: true,
      }}
      expires={new Date(Date.now() + 3600)}
      statistics={{
        done: 1,
        progress: 0,
        total: 10,
      }}
    />
  );
};
