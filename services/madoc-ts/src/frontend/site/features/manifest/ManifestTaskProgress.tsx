import React, { useEffect, useState } from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { Button, ButtonIcon, ButtonRow } from '../../../shared/navigation/Button';
import { GridContainer, HalfGird } from '../../../shared/layout/Grid';
import { Input, InputContainer, InputLabel } from '../../../shared/form/Input';
import { WhiteTickIcon } from '../../../shared/icons/TickIcon';
import { ItemFilterContainer, ItemFilterPopupContainer } from '../../../shared/components/ItemFilter';
import { useApi } from '../../../shared/hooks/use-api';
import { useUser } from '../../../shared/hooks/use-site';
import { InfoIcon } from '../../../shared/icons/InfoIcon';
import { createLink } from '../../../shared/utility/create-link';
import { HrefLink } from '../../../shared/utility/href-link';
import { useActivityStreamConfig } from '../../hooks/use-activity-stream-config';
import { useManifestTask } from '../../hooks/use-manifest-task';
import { useRouteContext } from '../../hooks/use-route-context';

export const ManifestTaskProgress: React.FC = () => {
  const { t } = useTranslation();
  const { buttonProps, isOpen } = useDropdownMenu(1, {
    disableFocusFirstItemOnClick: true,
  });
  const { projectId, manifestId } = useRouteContext();
  const api = useApi();
  const user = useUser();
  const isAdmin =
    user && user.scope && (user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('tasks.admin') !== -1);
  const canProgress = user && user.scope && user.scope.indexOf('tasks.create') !== -1;
  const activityStreams = useActivityStreamConfig();
  const [isPublished, setIsPublished] = useState(false);

  const { manifestTask, totalContributors, refetch } = useManifestTask();

  const [requiredApprovals, setRequiredApprovals] = useState(0);

  useEffect(() => {
    if (manifestTask && manifestTask.type === 'crowdsourcing-manifest-task') {
      setRequiredApprovals(manifestTask.state.approvalsRequired || 0);
    }
  }, [manifestTask]);

  const [markAsComplete, markAsCompleteStatus] = useMutation(async () => {
    if (manifestTask) {
      await api.updateRevisionTask(manifestTask.id, {
        status: 3,
        status_text: 'completed',
      });
      await refetch();
    }
  });

  const [markAsIncomplete, markAsIncompleteStatus] = useMutation(async () => {
    if (manifestTask) {
      await api.updateRevisionTask(manifestTask.id, {
        status: 2,
        status_text: 'in progress',
      });
      await refetch();
    }
  });

  const [updateRequiredApprovals, updateRequiredApprovalsStatus] = useMutation(async () => {
    if (manifestTask) {
      await api.updateRevisionTask(manifestTask.id, {
        state: {
          approvalsRequired: requiredApprovals,
        },
      });
      await refetch();
    }
  });

  const [submitToCuratedFeed, submitToCuratedFeedStatus] = useMutation(async () => {
    if (projectId && manifestId) {
      await api.submitToCuratedFeed(projectId, manifestId);
      setIsPublished(true);
    }
  });

  if (!projectId || (!isAdmin && !canProgress)) {
    return null;
  }

  return (
    <ItemFilterContainer>
      <Button {...buttonProps}>
        <ButtonIcon>
          <InfoIcon />
        </ButtonIcon>
        {t('Details')}
      </Button>
      <ItemFilterPopupContainer $visible={isOpen} $alignLeft={true} role="menu">
        <div style={{ width: 400, padding: '1em' }}>
          {manifestTask?.status === 2 ? (
            <div>
              {t('Current status')}: <strong>{manifestTask.status_text}</strong>
              <ButtonRow>
                <Button onClick={() => markAsComplete()} disabled={markAsCompleteStatus.isLoading}>
                  <ButtonIcon>
                    <WhiteTickIcon />
                  </ButtonIcon>
                  {t('Mark as complete')}
                </Button>
              </ButtonRow>
              {isAdmin &&
                manifestTask?.type === 'crowdsourcing-manifest-task' &&
                manifestTask?.state.approvalsRequired && (
                  <div>
                    <InputContainer>
                      <InputLabel htmlFor="approvals">
                        {t('Approvals required')} ({manifestTask.state.approvalsRequired})
                      </InputLabel>
                      <GridContainer>
                        <HalfGird $margin>
                          <Input
                            type="number"
                            id="approvals"
                            value={requiredApprovals}
                            onChange={e => {
                              const newValue = Number(e.target.value);
                              if (!Number.isNaN(newValue)) {
                                setRequiredApprovals(newValue);
                              }
                            }}
                          />
                        </HalfGird>
                        <HalfGird $margin>
                          <Button
                            $primary
                            disabled={
                              manifestTask.state.approvalsRequired === requiredApprovals ||
                              updateRequiredApprovalsStatus.isLoading
                            }
                            onClick={() => updateRequiredApprovals()}
                          >
                            {updateRequiredApprovalsStatus.isLoading ? t('Loading') : t('Update required approvals')}
                          </Button>
                        </HalfGird>
                      </GridContainer>
                    </InputContainer>
                  </div>
                )}
            </div>
          ) : null}
          {manifestTask?.status === 3 ? (
            <div>
              {t('Current status')}: <strong>{manifestTask.status_text}</strong>
              <ButtonRow>
                <Button onClick={() => markAsIncomplete()} disabled={markAsIncompleteStatus.isLoading}>
                  {t('Mark as incomplete')}
                </Button>
              </ButtonRow>
            </div>
          ) : null}
          {!manifestTask || manifestTask.status <= 1 ? (
            <div>
              {t('Current status')}: <strong>{manifestTask ? manifestTask.status_text : 'Not started'}</strong>
              {manifestTask ? (
                <ButtonRow>
                  <Button onClick={() => markAsComplete()} disabled={markAsCompleteStatus.isLoading}>
                    <ButtonIcon>
                      <WhiteTickIcon />
                    </ButtonIcon>
                    {t('Mark as complete')}
                  </Button>
                </ButtonRow>
              ) : null}
            </div>
          ) : null}

          {activityStreams.curated ? (
            <div>
              <h4>{t('Activity stream')}</h4>
              <ButtonRow>
                <Button
                  disabled={submitToCuratedFeedStatus.isLoading || isPublished}
                  onClick={() => submitToCuratedFeed()}
                >
                  {isPublished ? t('Published!') : t('Publish to curated stream')}
                </Button>
              </ButtonRow>
            </div>
          ) : null}

          {typeof totalContributors !== 'undefined' ? (
            <div>
              {t('Total contributors')}: <strong>{totalContributors}</strong>
              <ButtonRow>
                <Button
                  as={HrefLink}
                  href={createLink({
                    projectId,
                    subRoute: 'tasks',
                    query: { subject: `urn:madoc:manifest:${manifestId}` },
                  })}
                >
                  {t('See contributions')}
                </Button>
              </ButtonRow>
            </div>
          ) : null}
        </div>
      </ItemFilterPopupContainer>
    </ItemFilterContainer>
  );
};
