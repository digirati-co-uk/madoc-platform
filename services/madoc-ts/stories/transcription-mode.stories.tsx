import { boolean } from '@storybook/addon-knobs';
import { useState } from 'react';
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import styled, { css } from 'styled-components';
import { GridContainer } from '../src/frontend/shared/atoms/Grid';
import { SubtaskProgress } from '../src/frontend/shared/atoms/SubtaskProgress';
import { SuccessMessage } from '../src/frontend/shared/atoms/SuccessMessage';
import { TickIcon, WhiteTickIcon } from '../src/frontend/shared/atoms/TickIcon';
import { WarningMessage } from '../src/frontend/shared/atoms/WarningMessage';
import { WidePageWrapper } from '../src/frontend/shared/atoms/WidePage';
import { Button, ButtonIcon, ButtonRow, RightButtonIconBox } from '../src/frontend/shared/atoms/Button';
import { ErrorMessage } from '../src/frontend/shared/atoms/ErrorMessage';
import { ModalButton } from '../src/frontend/shared/components/Modal';
import { ProjectStatistics } from '../src/frontend/site/features/ProjectStatistics';

export default { title: 'Transcription mode' };

// Workflow bar.

const WorkflowBarContainer = styled.div<{ $fixed?: boolean }>`
  background: #fff;

  ${props =>
    props.$fixed &&
    css`
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      box-shadow: -4px 0 8px 0 rgba(0, 0, 0, 0.3);
      padding: 1em;
    `}
`;

export type WorkflowBarProps = {
  actions: {
    onTooDifficult: () => void;
    onUnusable: () => void;
    onSubmit: () => void;
  };
  states: {
    canSubmit: boolean;
    isUnusable: boolean;
    isSubmitted: boolean;
    isComplete: boolean;
    hasExpired: boolean;
    willExpireSoon: boolean;
  };
  expires: Date;
  statistics: {
    done: number;
    progress: number;
    total: number;
  };
};

const WorkflowCanvasActions = styled.div`
  width: 50%;
  padding: 1em;
`;
const WorkflowManifestActions = styled.div`
  width: 50%;
  text-align: right;
  padding: 1em;
`;

export const WorkflowBar: React.FC<WorkflowBarProps> = ({ actions = {}, states = {}, expires, statistics }) => {
  const { onTooDifficult, onSubmit, onUnusable } = actions;
  // const { canSubmit, isSubmitted, isTooDifficult, isComplete, isUnusable } = states;

  const canSubmit =
    states.canSubmit && !states.isSubmitted && !states.isComplete && !states.isUnusable && !states.hasExpired;
  const canClickUnusable = !states.isSubmitted && !states.isComplete && !states.hasExpired;
  const canClickTooDifficult = !states.isComplete && !states.hasExpired;
  const isUnusable = states.isUnusable;
  const isCloseToExpire = states.willExpireSoon && !states.isSubmitted;

  // Main messages.
  // - Is complete                                 | Success
  // - Close to expire                             | Warning
  // - Expires                                     | Error
  // - All items in progress, but none submitted.  | Warning

  return (
    <WorkflowBarContainer>
      <WidePageWrapper $noPadding>
        {states.isComplete ? (
          <SuccessMessage style={{ marginBottom: '.5em' }}>Manifest complete</SuccessMessage>
        ) : states.hasExpired ? (
          <ErrorMessage style={{ marginBottom: '.5em' }}>Expired</ErrorMessage>
        ) : isCloseToExpire ? (
          <WarningMessage style={{ marginBottom: '.5em' }}>Close to expire</WarningMessage>
        ) : null}
        <GridContainer>
          <WorkflowCanvasActions>
            <ButtonRow $noMargin>
              <Button $primary disabled={!canSubmit} onClick={onSubmit} $success={states.isSubmitted}>
                {states.isSubmitted ? (
                  <>
                    <ButtonIcon>
                      <WhiteTickIcon style={{ fill: '#fff' }} />
                    </ButtonIcon>
                    Submitted
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
              <ModalButton
                title="Too difficult"
                render={() => {
                  return <div>This is too difficult. You will be unassigned.</div>;
                }}
                renderFooter={({ close }) => {
                  return (
                    <ButtonRow $noMargin>
                      <Button onClick={() => close()}>Continue working</Button>
                      <Button
                        $primary
                        onClick={() => {
                          onTooDifficult();
                        }}
                      >
                        Mark as too difficult
                      </Button>
                    </ButtonRow>
                  );
                }}
              >
                <Button disabled={!canClickTooDifficult}>Too difficult</Button>
              </ModalButton>
              <Button onClick={onUnusable} disabled={!canClickUnusable}>
                Unusable
                <RightButtonIconBox $checked={isUnusable}>
                  <WhiteTickIcon />
                </RightButtonIconBox>
              </Button>
            </ButtonRow>
          </WorkflowCanvasActions>
          <SubtaskProgress progress={statistics.progress} total={statistics.total} done={statistics.done} />
          <WorkflowManifestActions>
            <ButtonRow $noMargin>
              <Button>Previous</Button>
              <Button>Next</Button>
            </ButtonRow>
          </WorkflowManifestActions>
        </GridContainer>
      </WidePageWrapper>
    </WorkflowBarContainer>
  );
};

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
