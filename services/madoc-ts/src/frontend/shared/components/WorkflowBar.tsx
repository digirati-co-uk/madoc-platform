import * as React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { CanvasManifestPagination } from '../../site/features/CanvasManifestPagination';
import { Button, ButtonIcon, ButtonRow, RightButtonIconBox } from '../atoms/Button';
import { ErrorMessage } from '../atoms/ErrorMessage';
import { GridContainer } from '../atoms/Grid';
import { SubtaskProgress } from '../atoms/SubtaskProgress';
import { SuccessMessage } from '../atoms/SuccessMessage';
import { WhiteTickIcon } from '../atoms/TickIcon';
import { WarningMessage } from '../atoms/WarningMessage';
import { WidePageWrapper } from '../atoms/WidePage';
import { ModalButton } from './Modal';

export type WorkflowBarProps = {
  fixed?: boolean;
  actions: {
    onTooDifficult: () => void;
    onUnusable: () => void;
    onSubmit: () => void;
  };
  states: {
    isLoading?: boolean;
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

const WorkflowBarContainer = styled.div<{ $fixed?: boolean }>`
  background: #fff;

  ${props =>
    props.$fixed &&
    css`
      z-index: 20;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      box-shadow: -4px 0 8px 0 rgba(0, 0, 0, 0.3);
      padding: 1em;
    `}
`;

const WorkflowCanvasActions = styled.div`
  width: 50%;
  padding: 1em;
`;

const WorkflowManifestActions = styled.div`
  width: 300px;
  padding: 0.5em;
  text-align: right;
  margin-left: auto;
`;

export const WorkflowBar: React.FC<WorkflowBarProps> = ({ actions = {}, states = {}, expires, statistics, fixed }) => {
  const { t } = useTranslation();
  const { onTooDifficult, onSubmit, onUnusable } = actions;

  const canSubmit =
    states.canSubmit &&
    !states.isSubmitted &&
    !states.isComplete &&
    !states.isUnusable &&
    !states.hasExpired &&
    !states.isLoading;
  const canClickUnusable =
    !states.isSubmitted && !states.isComplete && !states.hasExpired && !states.isLoading && !states.canSubmit;
  const canClickTooDifficult = !states.isComplete && !states.hasExpired && !states.isLoading;
  const isUnusable = states.isUnusable;
  const isCloseToExpire = states.willExpireSoon && !states.isSubmitted;

  return (
    <WorkflowBarContainer $fixed={fixed}>
      <WidePageWrapper $noPadding>
        {states.isComplete ? (
          <SuccessMessage style={{ marginBottom: '.5em' }}>{t('Manifest complete')}</SuccessMessage>
        ) : states.hasExpired ? (
          <ErrorMessage style={{ marginBottom: '.5em' }}>{t('Expired')}</ErrorMessage>
        ) : isCloseToExpire ? (
          <WarningMessage style={{ marginBottom: '.5em' }}>{t('Close to expire')}</WarningMessage>
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
                    {t('Submitted')}
                  </>
                ) : (
                  t('Submit')
                )}
              </Button>
              <ModalButton
                title="Too difficult"
                render={() => {
                  // @todo improve copy.
                  return <div>All of your work on these images will be lose if you continue. (not implemented)</div>;
                }}
                renderFooter={({ close }) => {
                  return (
                    <ButtonRow $noMargin>
                      <Button onClick={() => close()}>{t('Cancel')}</Button>
                      {onTooDifficult ? (
                        <Button
                          $primary
                          onClick={() => {
                            onTooDifficult();
                          }}
                        >
                          {t('Mark as too difficult')}
                        </Button>
                      ) : null}
                    </ButtonRow>
                  );
                }}
              >
                <Button disabled={!canClickTooDifficult}>Too difficult</Button>
              </ModalButton>
              <Button onClick={onUnusable} disabled={!canClickUnusable}>
                {t('Unusable')}
                <RightButtonIconBox $checked={isUnusable}>
                  <WhiteTickIcon />
                </RightButtonIconBox>
              </Button>
            </ButtonRow>
          </WorkflowCanvasActions>
          <SubtaskProgress progress={statistics.progress} total={statistics.total} done={statistics.done} />
          {fixed ? (
            <WorkflowManifestActions>
              <CanvasManifestPagination subRoute="model" />
            </WorkflowManifestActions>
          ) : null}
        </GridContainer>
      </WidePageWrapper>
    </WorkflowBarContainer>
  );
};
