import React, { useEffect, useMemo, useState } from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import { Button, ButtonIcon, ButtonRow } from '../../shared/atoms/Button';
import { GridContainer, HalfGird } from '../../shared/atoms/Grid';
import { Input, InputContainer, InputLabel } from '../../shared/atoms/Input';
import { WhiteTickIcon } from '../../shared/atoms/TickIcon';
import { ItemFilterContainer, ItemFilterPopupContainer } from '../../shared/components/ItemFilter';
import { useApi } from '../../shared/hooks/use-api';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { useUser } from '../../shared/hooks/use-site';
import { InfoIcon } from '../../shared/icons/InfoIcon';
import { createLink } from '../../shared/utility/create-link';
import { HrefLink } from '../../shared/utility/href-link';
import { useRouteContext } from '../hooks/use-route-context';

export const CanvasTaskProgress: React.FC = () => {
  const { t } = useTranslation();
  const { buttonProps, isOpen } = useDropdownMenu(1);
  const { canvasId } = useRouteContext();
  const api = useApi();
  const user = useUser();
  const isAdmin =
    user && user.scope && (user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('tasks.admin') !== -1);
  const canProgress = user && user.scope && user.scope.indexOf('tasks.progress') !== -1;

  const { slug } = useParams<{ slug?: string }>();
  const { data: projectTasks, refetch } = apiHooks.getSiteProjectCanvasTasks(
    () => (slug && canvasId ? [slug, canvasId] : undefined),
    {
      refetchOnMount: true,
    }
  );

  const canvasTask = projectTasks?.canvasTask;

  const [requiredApprovals, setRequiredApprovals] = useState(0);

  useEffect(() => {
    if (canvasTask) {
      setRequiredApprovals(canvasTask.state.approvalsRequired || 0);
    }
  }, [canvasTask]);

  const [markAsComplete, markAsCompleteStatus] = useMutation(async () => {
    if (canvasTask) {
      await api.updateTask(canvasTask.id, {
        status: 3,
        status_text: 'completed',
      });
      await refetch();
    }
  });

  const [markAsIncomplete, markAsIncompleteStatus] = useMutation(async () => {
    if (canvasTask) {
      await api.updateTask(canvasTask.id, {
        status: 2,
        status_text: 'in progress',
      });
      await refetch();
    }
  });

  const [updateRequiredApprovals, updateRequiredApprovalsStatus] = useMutation(async () => {
    if (canvasTask) {
      await api.updateTask(canvasTask.id, {
        state: {
          approvalsRequired: requiredApprovals,
        },
      });
      await refetch();
    }
  });

  if (!slug || (!isAdmin && !canProgress)) {
    return null;
  }

  return (
    <ItemFilterContainer style={{ marginLeft: '.5em' }}>
      <Button {...buttonProps}>
        <ButtonIcon>
          <InfoIcon />
        </ButtonIcon>
        {t('Details')}
      </Button>
      <ItemFilterPopupContainer $visible={isOpen} role="menu">
        <div style={{ width: 400, padding: '1em' }}>
          {canvasTask?.status === 2 ? (
            <div>
              {t('Current status')}: <strong>{canvasTask.status_text}</strong>
              <ButtonRow>
                <Button onClick={() => markAsComplete()} disabled={markAsCompleteStatus.isLoading}>
                  <ButtonIcon>
                    <WhiteTickIcon />
                  </ButtonIcon>
                  {t('Mark as complete')}
                </Button>
              </ButtonRow>
              {isAdmin && canvasTask?.state.approvalsRequired && (
                <div>
                  <InputContainer>
                    <InputLabel htmlFor="approvals">
                      {t('Approvals required')} ({canvasTask.state.approvalsRequired})
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
                            canvasTask.state.approvalsRequired === requiredApprovals ||
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
          {canvasTask?.status === 3 ? (
            <div>
              {t('Current status')}: <strong>{canvasTask.status_text}</strong>
              <ButtonRow>
                <Button onClick={() => markAsIncomplete()} disabled={markAsIncompleteStatus.isLoading}>
                  {t('Mark as incomplete')}
                </Button>
              </ButtonRow>
            </div>
          ) : null}
          {!canvasTask || canvasTask.status <= 1 ? (
            <div>
              {t('Current status')}: <strong>{canvasTask ? canvasTask.status_text : 'Not started'}</strong>
              {canvasTask ? (
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
          {projectTasks?.totalContributors ? (
            <div>
              {t('Total contributors')}: <strong>{projectTasks.totalContributors}</strong>
              <ButtonRow>
                <Button
                  as={HrefLink}
                  href={createLink({
                    projectId: slug,
                    subRoute: 'tasks',
                    query: { subject: `urn:madoc:canvas:${canvasId}` },
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
