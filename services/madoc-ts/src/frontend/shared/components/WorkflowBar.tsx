import * as React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { Button, ButtonIcon, ButtonRow, RightButtonIconBox } from '../atoms/Button';
import { ErrorMessage } from '../atoms/ErrorMessage';
import { GridContainer } from '../atoms/Grid';
import { SubtaskProgress } from '../atoms/SubtaskProgress';
import { SuccessMessage } from '../atoms/SuccessMessage';
import { WhiteTickIcon } from '../atoms/TickIcon';
import { WarningMessage } from '../atoms/WarningMessage';
import { WidePageWrapper } from '../atoms/WidePage';
import { HrefLink } from '../utility/href-link';
import { useManifestPagination } from './CanvasNavigationMinimalist';
import { ModalButton } from './Modal';

export type WorkflowBarProps = {
  fixed?: boolean;
  actions: {
    onTooDifficult: () => void;
    onUnusable: (isUsable?: boolean) => void;
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
  padding: 1em;
  margin-right: auto;
`;

const WorkflowActions = styled.div`
  display: flex;
  padding: 1em;
`;

const WorkflowManifestActions = styled.div`
  width: 300px;
  padding: 1em;
  margin-left: auto;
`;

export const WorkflowBar: React.FC<WorkflowBarProps> = ({ actions = {}, states = {}, expires, statistics, fixed }) => {
  const { t } = useTranslation();
  const { onTooDifficult, onSubmit, onUnusable } = actions;
  const manifestPagination = useManifestPagination('model');

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
              {states.isSubmitted ? (
                <Button $primary disabled $success>
                  <ButtonIcon>
                    <WhiteTickIcon style={{ fill: '#fff' }} />
                  </ButtonIcon>
                  {t('Submitted')}
                </Button>
              ) : (
                <ModalButton
                  title={t('Are you sure?')}
                  render={() => {
                    return (
                      <div>
                        <h4>{t('Are you sure you want to submit this canvas?')}</h4>
                        <p>{t('You will not be able to make any further changes')}</p>
                      </div>
                    );
                  }}
                  renderFooter={({ close }) => {
                    return (
                      <ButtonRow $noMargin>
                        <Button onClick={() => close()}>{t('Cancel')}</Button>
                        {onTooDifficult ? (
                          <Button $primary onClick={onSubmit}>
                            {t('Submit')}
                          </Button>
                        ) : null}
                      </ButtonRow>
                    );
                  }}
                >
                  <Button $primary disabled={!canSubmit}>
                    {t('Submit')}
                  </Button>
                </ModalButton>
              )}
              <Button onClick={() => (onUnusable ? onUnusable(!isUnusable) : void 0)} disabled={!canClickUnusable}>
                {t('Unusable')}
                <RightButtonIconBox $checked={isUnusable}>
                  <WhiteTickIcon />
                </RightButtonIconBox>
              </Button>
            </ButtonRow>
          </WorkflowCanvasActions>
          <WorkflowActions>
            <ModalButton
              title={t('Too difficult')}
              render={() => {
                // @todo improve copy.
                return (
                  <div>
                    {t(
                      'All of your work on these images will be lost if you continue and you will be taken back to the project homepage'
                    )}
                  </div>
                );
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
              <Button disabled={!canClickTooDifficult}>{t('Too difficult')}</Button>
            </ModalButton>
            <div style={{ width: 300 }}>
              <SubtaskProgress
                hideComplete
                progress={statistics.progress}
                total={statistics.total}
                done={statistics.done}
                tooltip={false}
              />
            </div>
          </WorkflowActions>

          {fixed ? (
            <WorkflowManifestActions>
              {manifestPagination ? (
                <ButtonRow $noMargin>
                  {manifestPagination.hasPrevPage ? (
                    <Button as={HrefLink} href={manifestPagination.prevPage}>
                      {t('Previous')}
                    </Button>
                  ) : null}
                  {manifestPagination.hasNextPage ? (
                    <Button as={HrefLink} href={manifestPagination.nextPage}>
                      {t('Next')}
                    </Button>
                  ) : null}
                </ButtonRow>
              ) : null}
            </WorkflowManifestActions>
          ) : null}
        </GridContainer>
      </WidePageWrapper>
    </WorkflowBarContainer>
  );
};
